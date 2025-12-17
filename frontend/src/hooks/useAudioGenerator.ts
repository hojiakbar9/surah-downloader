import { useState } from "react";
import { audioApi, type JobPayload } from "../services/audioApi";

export function useAudioGenerator() {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  // Helper to format the message based on backend data
  const formatStatusMessage = (data: any) => {
    if (data.status === "processing") {
      if (data.stage === "downloading") {
        const { current, total } = data.progress;
        const percent = Math.round((current / total) * 100);
        return `Downloading verses: ${current} / ${total} (${percent}%)`;
      } else if (data.stage === "stitching") {
        return "Stitching audio files together... (This may take a moment)";
      } else {
        return "Initializing job...";
      }
    }
    return "Processing...";
  };

  const generateAudio = async (payload: JobPayload) => {
    setLoading(true);
    setAudioSrc(null);
    setError(null);
    setStatusMsg("Starting job...");

    try {
      const jobId = await audioApi.startJob(payload);

      let isFinished = false;
      while (!isFinished) {
        const data = await audioApi.checkStatus(jobId);

        setStatusMsg(formatStatusMessage(data));

        if (data.status === "completed") {
          isFinished = true;
        } else if (data.status === "failed") {
          throw new Error(data.error || "Job failed");
        } else {
          await wait(1000);
        }
      }

      setStatusMsg("Downloading final audio...");
      const blob = await audioApi.downloadFile(jobId);
      const audioUrl = URL.createObjectURL(blob);

      setAudioSrc(audioUrl);
      setStatusMsg("Done!");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setStatusMsg("");
    } finally {
      setLoading(false);
    }
  };

  return { generateAudio, audioSrc, statusMsg, loading, error };
}
