// src/workers/audioWorker.js

import downloadAyahs from "../services/downloader.js";
import buildSequence from "../services/sequenceBuilder.js";
import writeFile from "../utils/fileWriter.js";
import runFfmpeg from "../services/ffmpegRunner.js";
import cleanupJob from "../services/cleanup.js";
import { jobStore } from "../store/jobStore.js";

export async function processAudioJob({
  jobId,
  surahNumber,
  startAyah,
  endAyah,
  repeatCount,
  jobPath,
  reciterId,
}) {
  try {
    jobStore.update(jobId, {
      stage: "downloading",
      progress: { current: 0, total: endAyah - startAyah + 1 },
    });
    console.log(`[Job ${jobId}] Starting processing...`);

    // 1. Download the audio files

    await downloadAyahs(
      surahNumber,
      startAyah,
      endAyah,
      jobPath,
      reciterId,
      (current, total) => {
        jobStore.update(jobId, { progress: { current, total } });
      }
    );

    jobStore.update(jobId, { stage: "stitching" });
    // 2. Build the sequence file content for FFmpeg
    const content = buildSequence(
      jobPath,
      surahNumber,
      startAyah,
      endAyah,
      repeatCount
    );

    // 3. Write the sequence file (input.txt) to disk
    await writeFile(jobPath, content);

    // 4. Run FFmpeg to merge files
    await runFfmpeg(jobPath);

    jobStore.update(jobId, { status: "completed", stage: "ready" });
    // 5. Success! Update the store
    console.log(`[Job ${jobId}] Completed successfully.`);
  } catch (err) {
    console.error(`[Job ${jobId}] Failed:`, err);

    // 6. Failure! Update the store with the error message
    jobStore.update(jobId, { status: "failed" });

    // 7. Cleanup immediately on failure to save disk space
    await cleanupJob(jobPath);
  }
}
