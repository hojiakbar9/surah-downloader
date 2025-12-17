import { useRef } from "react";
import { useAudioGenerator } from "./hooks/useAudioGenerator";
import "./App.css";

function App() {
  // 1. Initialize the hook
  const { generateAudio, audioSrc, statusMsg, loading, error } =
    useAudioGenerator();

  // Refs for inputs
  const surahRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const countRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // 2. Collect data from inputs
    const payload = {
      surahNumber: parseInt(surahRef.current?.value || "0"),
      startAyah: parseInt(startRef.current?.value || "0"),
      endAyah: parseInt(endRef.current?.value || "0"),
      repeatCount: parseInt(countRef.current?.value || "0"),
    };

    // 3. Trigger the logic from the hook
    generateAudio(payload);
  };

  return (
    <div>
      <h2>Quran Audio Generator</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="surah">Surah Number</label>
          <input ref={surahRef} type="number" id="surah" required />
        </div>
        <div>
          <label htmlFor="start">Start Ayah</label>
          <input ref={startRef} type="number" id="start" required />
        </div>
        <div>
          <label htmlFor="end">End Ayah</label>
          <input ref={endRef} type="number" id="end" required />
        </div>
        <div>
          <label htmlFor="count">Repeat Count</label>
          <input ref={countRef} type="number" id="count" required />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Please Wait..." : "Generate Audio"}
        </button>
      </form>

      {/* UI Logic for feedback */}
      {statusMsg && <p className="status">{statusMsg}</p>}
      {error && (
        <p className="error" style={{ color: "red" }}>
          Error: {error}
        </p>
      )}

      {audioSrc && (
        <div className="player-container">
          <h3>Generated Audio:</h3>
          <audio controls src={audioSrc} autoPlay />
        </div>
      )}
    </div>
  );
}

export default App;
