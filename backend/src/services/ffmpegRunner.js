import { spawn } from "child_process";
import path from "path";

export default function runFfmpeg(jobPath) {
  return new Promise((resolve, reject) => {
    const concatFile = path.join(jobPath, "input.txt");
    const outputFile = path.join(jobPath, "output.mp3");

    const ffmpeg = spawn("ffmpeg", [
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatFile,
      "-c",
      "copy",
      outputFile,
    ]);

    ffmpeg.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
        console.log("FFmpeg finished successfully");
      } else {
        reject(new Error(`Ffmpeg exited with code ${code}`));
      }
    });
  });
}
