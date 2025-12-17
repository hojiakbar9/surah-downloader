interface AudioPlayerProps {
  src: string;
}

export function AudioPlayer({ src }: AudioPlayerProps) {
  return (
    <div
      className="player-container"
      style={{
        marginTop: "20px",
        padding: "15px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h3>Generated Audio:</h3>
      <audio controls src={src} style={{ width: "100%" }}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
