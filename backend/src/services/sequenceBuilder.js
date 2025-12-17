import { resolvePath } from "./resolvers.js";
import path from "path";

export default function buildSequence(
  jobPath,
  surahNumber,
  start,
  end,
  repeatCount
) {
  let content = "";

  for (let ayah = start; ayah <= end; ayah++) {
    // 1. Get the full path (e.g., tmp/jobs/abc/001_001.mp3)
    const fullPath = resolvePath(jobPath, surahNumber, ayah);

    // 2. Extract ONLY the filename (e.g., 001_001.mp3)
    const fileName = path.basename(fullPath);

    // 3. Write just the filename to the list
    for (let r = 0; r < repeatCount; r++) {
      content += `file '${fileName}'\n`;
    }
  }

  return content;
}
