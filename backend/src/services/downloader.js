import axios from "axios";
import fs from "fs";
import { resolveAyah, resolvePath } from "./resolvers.js";

/**
 * Helper: Downloads a single file from a URL to a local path.
 * Returns a Promise that resolves when the file is fully written.
 */
function downloadAyah(url, outputPath) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: "get",
        url: url,
        responseType: "stream",
      });

      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      writer.on("finish", resolve);
      writer.on("error", reject);
      response.data.on("error", (err) => reject(err)); // Catch network stream errors
    } catch (err) {
      reject(new Error(`Failed to fetch ${url}: ${err.message}`));
    }
  });
}

/**
 * Main Downloader Function
 * - Batches downloads to prevent rate limiting.
 * - Updates progress individually for smooth UI feedback.
 */
export default async function downloadAyahs(
  surahNumber,
  start,
  end,
  jobPath,
  onProgress
) {
  const batchSize = 10; // Max concurrent downloads
  const allAyahs = [];

  // 1. Generate the list of ayah numbers
  for (let i = start; i <= end; i++) {
    allAyahs.push(i);
  }

  let completedCount = 0;

  // 2. Process in batches
  for (let i = 0; i < allAyahs.length; i += batchSize) {
    const batch = allAyahs.slice(i, i + batchSize);

    // Map the current batch to promises
    const downloadPromises = batch.map((ayah) => {
      const url = resolveAyah(surahNumber, ayah);
      const path = resolvePath(jobPath, surahNumber, ayah);

      // Call the helper, then update progress immediately upon success
      return downloadAyah(url, path).then(() => {
        completedCount++;
        if (onProgress) {
          onProgress(completedCount, allAyahs.length);
        }
      });
    });

    await Promise.all(downloadPromises);
  }

  console.log(`[Job] Downloaded ${completedCount} files.`);
}
