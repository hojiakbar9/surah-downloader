import { useAudioGenerator } from "./hooks/useAudioGenerator";
import { AudioForm } from "./components/AudioForm";
import { AudioPlayer } from "./components/AudioPlayer";
import "./App.css";

function App() {
  const { generateAudio, audioSrc, statusMsg, loading, error } =
    useAudioGenerator();

  return (
    <div className="app-container">
      <h2>Quran Audio Generator</h2>

      {/* 1. The Input Section */}
      <AudioForm onSubmit={generateAudio} loading={loading} />

      {/* 2. The Feedback Section */}
      <div className="results-area">
        {statusMsg && <p className="status">{statusMsg}</p>}
        {error && (
          <p className="error" style={{ color: "red" }}>
            Error: {error}
          </p>
        )}

        {/* 3. The Result Section */}
        {audioSrc && <AudioPlayer src={audioSrc} />}
      </div>
    </div>
  );
}

export default App;
