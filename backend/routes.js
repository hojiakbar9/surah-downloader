import downloadAyahs from "./services/downloader.js";
import generatePaths from "./utils/generatePath.js";
import buildSequence from "./services/sequenceBuilder.js";
import writeFile from "./utils/fileWriter.js";
import runFfmpeg from "./services/ffmpegRunner.js";
import cleanupJob from "./services/cleanup.js";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

// IN-MEMORY JOB STORE (Replace with Redis/DB in production)
const jobs = {};

const generateAudioBodySchema = {
  type: "object",
  required: ["surahNumber", "startAyah", "endAyah", "repeatCount"],
  properties: {
    surahNumber: { type: "integer", minimum: 1, maximum: 114 },
    startAyah: { type: "integer", minimum: 1 },
    endAyah: { type: "integer", minimum: 1 },
    repeatCount: { type: "integer", minimum: 1, maximum: 5 },
  },
};

async function routes(fastify, options) {
  // --- ROUTE 1: Start the Job ---
  fastify.post(
    "/api/generate-audio",
    { schema: { body: generateAudioBodySchema } },
    async (request, reply) => {
      const { surahNumber, startAyah, endAyah, repeatCount } = request.body;

      // Create a unique ID and folder
      const jobId = randomUUID();
      const jobPath = generatePaths();

      // Initialize Job State
      jobs[jobId] = {
        status: "processing",
        path: jobPath,
        startTime: Date.now(),
        error: null,
      };

      processAudioJob(
        jobId,
        surahNumber,
        startAyah,
        endAyah,
        repeatCount,
        jobPath
      );

      return { jobId, message: "Job started" };
    }
  );

  // --- ROUTE 2: Check Status ---
  fastify.get("/api/status/:jobId", async (request, reply) => {
    const { jobId } = request.params;
    const job = jobs[jobId];

    if (!job) return reply.code(404).send({ error: "Job not found" });

    return {
      status: job.status,
      error: job.error,
    };
  });

  // --- ROUTE 3: Download File ---
  fastify.get("/api/download/:jobId", async (request, reply) => {
    const { jobId } = request.params;
    const job = jobs[jobId];

    if (!job || job.status !== "completed") {
      return reply.code(400).send({ error: "File not ready or job not found" });
    }

    const outputPath = path.join(job.path, "output.mp3");

    // Serve the file
    reply.header("Content-Type", "audio/mpeg");
    reply.header("Content-Disposition", `attachment; filename="output.mp3"`);

    const stream = fs.createReadStream(outputPath);
    await reply.send(stream);
    request.log.info(`Cleaning up job ${jobId}`);
    await cleanupJob(job.path);
    delete jobs[jobId];
  });
}

// --- Background Worker Function ---
async function processAudioJob(
  jobId,
  surahNumber,
  startAyah,
  endAyah,
  repeatCount,
  jobPath
) {
  try {
    await downloadAyahs(surahNumber, startAyah, endAyah, jobPath);
    const content = buildSequence(jobPath, repeatCount);
    await writeFile(jobPath, content);
    await runFfmpeg(jobPath);

    // Update job status to completed
    if (jobs[jobId]) {
      jobs[jobId].status = "completed";
    }
  } catch (err) {
    console.error(`Job ${jobId} failed:`, err);
    if (jobs[jobId]) {
      jobs[jobId].status = "failed";
      jobs[jobId].error = err.message;
    }
    // Cleanup failed jobs immediately to save space
    await cleanupJob(jobPath);
  }
}

export default routes;
