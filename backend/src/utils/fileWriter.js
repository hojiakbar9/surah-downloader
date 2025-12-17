import fs from "fs/promises";
import path from "path";
export default async function writeFile(filePath, content) {
  try {
    await fs.writeFile(path.join(filePath, "input.txt"), content, "utf8");
    console.log("File written successfully");
  } catch (err) {
    console.error("Error writing file:", err);
  }
}
