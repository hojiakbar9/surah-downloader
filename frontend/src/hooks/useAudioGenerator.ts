import { useState } from "react";
import { audioApi, type JobPayload } from "../services/audioApi";

export function useAudioGenerator() {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // 2. The main function to run the whole process
  const generateAudio = async (payload: JobPayload) => {
    setLoading(true);
    setAudioSrc(null);
    setError(null);
    setStatusMsg("Starting job...");

    try {
      // A. Start Job
      const jobId = await audioApi.startJob(payload);

      // B. Poll Status
      let isFinished = false;
      while (!isFinished) {
        setStatusMsg("Processing audio on server...");

        const data = await audioApi.checkStatus(jobId);

        if (data.status === "completed") {
          isFinished = true;
        } else if (data.status === "failed") {
          throw new Error(data.error || "Job failed");
        } else {
          await wait(2000); // Wait 2s before retrying
        }
      }

      // C. Download
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

  return {
    generateAudio,
    audioSrc,
    statusMsg,
    loading,
    error,
  };
}
