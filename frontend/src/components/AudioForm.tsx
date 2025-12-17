import { useState, useRef } from "react";
import { type JobPayload } from "../services/audioApi";
import { surahs } from "../data/surahs";

interface AudioFormProps {
  onSubmit: (payload: JobPayload) => void;
  loading: boolean;
}

export function AudioForm({ onSubmit, loading }: AudioFormProps) {
  // We use State for Surah because changing it affects the UI (Max Ayahs)
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1);

  // We can still use Refs for the simple number inputs to avoid excessive re-renders
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const countRef = useRef<HTMLInputElement>(null);

  // Get the details of the currently selected Surah
  // If not found (shouldn't happen), default to the first one
  const currentSurah =
    surahs.find((s) => s.number === selectedSurahId) || surahs[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: JobPayload = {
      surahNumber: selectedSurahId,
      startAyah: parseInt(startRef.current?.value || "1"),
      endAyah: parseInt(endRef.current?.value || "1"),
      repeatCount: parseInt(countRef.current?.value || "1"),
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 1. Surah Dropdown */}
      <div>
        <label htmlFor="surah">Select Surah</label>
        <select
          id="surah"
          value={selectedSurahId}
          onChange={(e) => {
            setSelectedSurahId(Number(e.target.value));
            // Optional: Reset start/end inputs when surah changes
            if (startRef.current) startRef.current.value = "1";
            if (endRef.current) endRef.current.value = "1";
          }}
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "16px",
          }}
        >
          {surahs.map((surah) => (
            <option key={surah.number} value={surah.number}>
              {surah.number}. {surah.name} ({surah.totalAyahs} Ayahs)
            </option>
          ))}
        </select>
      </div>

      {/* 2. Start Ayah (Dynamic Limit) */}
      <div>
        <label htmlFor="start">
          Start Ayah (Max: {currentSurah.totalAyahs})
        </label>
        <input
          ref={startRef}
          type="number"
          id="start"
          min="1"
          max={currentSurah.totalAyahs}
          defaultValue="1"
          required
        />
      </div>

      {/* 3. End Ayah (Dynamic Limit) */}
      <div>
        <label htmlFor="end">End Ayah (Max: {currentSurah.totalAyahs})</label>
        <input
          ref={endRef}
          type="number"
          id="end"
          min="1"
          max={currentSurah.totalAyahs}
          defaultValue={currentSurah.totalAyahs} // Default to full surah
          required
        />
      </div>

      {/* 4. Repeat Count */}
      <div>
        <label htmlFor="count">Repeat Count</label>
        <input
          ref={countRef}
          type="number"
          id="count"
          min="1"
          max="5"
          defaultValue="1"
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Generating..." : "Generate Audio"}
      </button>
    </form>
  );
}
