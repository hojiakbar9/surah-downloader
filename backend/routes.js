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
  // --- Global: Zombie Job Cleanup (Runs every 1 hour) ---
  // If a job is older than 1 hour, delete it to save space.
  setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
  }, 3600000);

  // --- ROUTE 1: Start Job ---
  fastify.post(
    "/api/generate-audio",
    { schema: { body: generateAudioBodySchema } },
    async (request, reply) => {
      const { surahNumber, startAyah, endAyah, repeatCount } = request.body;

      // 1. Logic Check: Start cannot be after End
      if (startAyah > endAyah) {
        return reply.code(400).send({
          error: "startAyah cannot be greater than endAyah",
        });
      }

      const jobId = randomUUID();
      const jobPath = generatePaths();

      // 2. Save to Store
      jobStore.create(jobId, { path: jobPath });

      // 3. Start Background Worker (Fire and Forget)
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
    const job = jobStore.get(jobId);

    if (!job) return reply.code(404).send({ error: "Job not found" });

    return {
      status: job.status,
      error: job.error,
    };
  });

  // --- ROUTE 3: Download ---
  fastify.get("/api/download/:jobId", async (request, reply) => {
    const { jobId } = request.params;
    const job = jobStore.get(jobId);

    if (!job || job.status !== "completed") {
      return reply.code(400).send({ error: "File not ready or job not found" });
    }

    const outputPath = path.join(job.path, "output.mp3");

    // 1. Check if file actually exists before streaming
    if (!fs.existsSync(outputPath)) {
      return reply.code(500).send({ error: "Output file missing on server" });
    }

    // 2. Serve file
    reply.header("Content-Type", "audio/mpeg");
    reply.header("Content-Disposition", `attachment; filename="output.mp3"`);

    const stream = fs.createReadStream(outputPath);

    // 3. Send the stream
    await reply.send(stream);

    // 4. CLEANUP SAFETY:
    // Fastify usually waits for stream to finish before resolving `send`,
    // but we force the stream to close to release file locks (crucial for Windows).
    stream.destroy();

    // 5. Now it is safe to delete
    request.log.info(`Cleaning up job ${jobId}`);
    await cleanupJob(job.path);
    jobStore.delete(jobId);
  });
}

export default routes;
