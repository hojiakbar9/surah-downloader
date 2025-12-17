import fs from "fs/promises";

export default async function cleanupJob(jobPath) {
  try {
    await fs.rm(jobPath, {
      recursive: true,
      force: true
    });
    console.log("Cleaned up job:", jobPath);
  } catch (err) {
    console.error("Cleanup failed:", err.message);
  }
}