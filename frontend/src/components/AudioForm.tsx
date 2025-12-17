import { useRef } from "react";
import { type JobPayload } from "../services/audioApi";

interface AudioFormProps {
  onSubmit: (payload: JobPayload) => void;
  loading: boolean;
}

export function AudioForm({ onSubmit, loading }: AudioFormProps) {
  // Refs live here now, close to the inputs they control
  const surahRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const countRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct the payload here
    const payload: JobPayload = {
      surahNumber: parseInt(surahRef.current?.value || "0"),
      startAyah: parseInt(startRef.current?.value || "0"),
      endAyah: parseInt(endRef.current?.value || "0"),
      repeatCount: parseInt(countRef.current?.value || "0"),
    };

    // Pass the clean data up to the parent
    onSubmit(payload);
  };

  return (
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
  );
}
