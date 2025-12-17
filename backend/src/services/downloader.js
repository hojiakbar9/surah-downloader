import axios from "axios";
import fs from "fs";
import { resolveAyah, resolvePath } from "./resolvers.js";

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
      response.data.on("error", reject);
    } catch (err) {
      reject(new Error(`Failed to fetch ${url}: ${err.message}`));
    }
  });
}

// Main: Download with Batching Control
export default async function downloadAyahs(surahNumber, start, end, jobPath) {
  const batchSize = 5; // Max simultaneous downloads
  const allAyahs = [];

  // 1. Create the list of Ayah numbers to download
  for (let i = start; i <= end; i++) {
    allAyahs.push(i);
  }

  // 2. Process the list in chunks
  for (let i = 0; i < allAyahs.length; i += batchSize) {
    const batch = allAyahs.slice(i, i + batchSize);

    // Map the batch to download promises
    const downloadPromises = batch.map((ayah) => {
      const url = resolveAyah(surahNumber, ayah);
      const path = resolvePath(jobPath, surahNumber, ayah);
      return downloadAyah(url, path);
    });

    await Promise.all(downloadPromises);
  }

  console.log("All downloads completed.");
}
