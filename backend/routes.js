import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

// Services & Utils
import generatePaths from "./src/utils/generatePath.js";
import cleanupJob from "./src/services/cleanup.js";
import { jobStore } from "./src/store/jobStore.js";
import { processAudioJob } from "./src/workers/audioWorker.js";

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
  // --- ROUTE 1: Start Job ---
  fastify.post(
    "/api/generate-audio",
    { schema: { body: generateAudioBodySchema } },
    async (request, reply) => {
      const { surahNumber, startAyah, endAyah, repeatCount } = request.body;

      const jobId = randomUUID();
      const jobPath = generatePaths();

      // 1. Save to Store
      jobStore.create(jobId, { path: jobPath });

      // 2. Start Background Worker (Fire and Forget)
      processAudioJob({
        jobId,
        surahNumber,
        startAyah,
        endAyah,
        repeatCount,
        jobPath,
      });

      return { jobId, message: "Job started" };
    }
  );

  // --- ROUTE 2: Check Status ---
  fastify.get("/api/status/:jobId", async (request, reply) => {
    const { jobId } = request.params;
    const job = jobStore.get(jobId); // Use Store

    if (!job) return reply.code(404).send({ error: "Job not found" });

    return {
      status: job.status,
      error: job.error,
    };
  });

  // --- ROUTE 3: Download ---
  fastify.get("/api/download/:jobId", async (request, reply) => {
    const { jobId } = request.params;
    const job = jobStore.get(jobId); // Use Store

    if (!job || job.status !== "completed") {
      return reply.code(400).send({ error: "File not ready or job not found" });
    }

    const outputPath = path.join(job.path, "output.mp3");

    // Serve file
    reply.header("Content-Type", "audio/mpeg");
    reply.header("Content-Disposition", `attachment; filename="output.mp3"`);

    const stream = fs.createReadStream(outputPath);
    await reply.send(stream);

    // Cleanup
    request.log.info(`Cleaning up job ${jobId}`);
    await cleanupJob(job.path);
    jobStore.delete(jobId); // Remove from Store
  });
}

export default routes;
