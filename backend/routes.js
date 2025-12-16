import downloadAyahs from "./services/downloader.js";
import generatePaths from "./utils/generatePath.js";
import buildSequence from "./services/sequenceBuilder.js";
import writeFile from "./utils/fileWriter.js";
import runFfmpeg from "./services/ffmpegRunner.js";
import cleanupJob from "./services/cleanup.js";
import fs from "fs";
import path from "path";
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

const schema = {
  body: generateAudioBodySchema,
};

async function routes(fastify, options) {
  fastify.post("/api/generate-audio", { schema }, async (request, reply) => {
    const { surahNumber, startAyah, endAyah, repeatCount } = request.body;
    const jobPath = generatePaths();

    try {
      await downloadAyahs(surahNumber, startAyah, endAyah, jobPath);

      const content = buildSequence(jobPath, repeatCount);
      await writeFile(jobPath, content);

      await runFfmpeg(jobPath);

      const outputPath = path.join(jobPath, "output.mp3");
      const stream = fs.createReadStream(outputPath);

      reply
        .header("Content-Type", "audio/mpeg")
        .header("Content-Disposition", 'attachment; filename="output.mp3"');

      stream.pipe(reply.raw);

      stream.on("close", async () => {
        await cleanupJob(jobPath);
      });

      reply.raw.on("close", async () => {
        stream.destroy();
        await cleanupJob(jobPath);
      });
    } catch (err) {
      await cleanupJob(jobPath);
      reply.code(500).send({
        error: "Audio Generation Failed",
        message: err.message,
      });
    }
  });
}

export default routes;
