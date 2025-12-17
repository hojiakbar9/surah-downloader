import { useState, useRef } from "react";
import "./App.css";

function App() {
  const API_BASE = "http://localhost:3000/api";

  // State for UI Feedback
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Form Refs
  const surahRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const countRef = useRef<HTMLInputElement>(null);

  // --- HELPER: Pause execution for X milliseconds ---
  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // --- STEP 1: Start the Job ---
  const startJob = async () => {
    const payload = {
      surahNumber: parseInt(surahRef.current?.value || "0"),
      startAyah: parseInt(startRef.current?.value || "0"),
      endAyah: parseInt(endRef.current?.value || "0"),
      repeatCount: parseInt(countRef.current?.value || "0"),
    };

    const response = await fetch(`${API_BASE}/generate-audio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Failed to start job");

    const data = await response.json();
    return data.jobId; // Returns the UUID
  };

  // --- STEP 2: Poll Status until Completed ---
  const pollForCompletion = async (jobId: string) => {
    let isFinished = false;

    while (!isFinished) {
      setStatusMsg("Processing audio on server...");

      const response = await fetch(`${API_BASE}/status/${jobId}`);
      const data = await response.json();

      if (data.status === "completed") {
        isFinished = true;
      } else if (data.status === "failed") {
        throw new Error(data.error || "Job failed on server");
      } else {
        // If "processing", wait 2 seconds before checking again
        await wait(2000);
      }
    }
  };

  // --- STEP 3: Download the Result ---
  const downloadResult = async (jobId: string) => {
    setStatusMsg("Downloading final audio...");

    const response = await fetch(`${API_BASE}/download/${jobId}`);
    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  // --- MAIN HANDLER ---
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setAudioSrc(null);
    setStatusMsg("Starting job...");

    try {
      // 1. Start
      const jobId = await startJob();

      // 2. Poll
      await pollForCompletion(jobId);

      // 3. Download
      const audioUrl = await downloadResult(jobId);

      setAudioSrc(audioUrl);
      setStatusMsg("Done!");
    } catch (error: any) {
      console.error(error);
      setStatusMsg(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Quran Audio Generator</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="surah">Surah Number (1-114)</label>
          <input
            ref={surahRef}
            type="number"
            id="surah"
            min="1"
            max="114"
            required
          />
        </div>
        <div>
          <label htmlFor="start">Start Ayah</label>
          <input ref={startRef} type="number" id="start" min="1" required />
        </div>
        <div>
          <label htmlFor="end">End Ayah</label>
          <input ref={endRef} type="number" id="end" min="1" required />
        </div>
        <div>
          <label htmlFor="count">Repeat Count</label>
          <input
            ref={countRef}
            type="number"
            id="count"
            min="1"
            max="5"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Please Wait..." : "Generate Audio"}
        </button>
      </form>

      {/* Status Message Display */}
      {statusMsg && (
        <p style={{ fontWeight: "bold", color: "#555" }}>{statusMsg}</p>
      )}

      {/* Audio Player */}
      {audioSrc && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ccc",
          }}
        >
          <h3>Generated Audio:</h3>
          <audio controls src={audioSrc} autoPlay>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}

export default App;
