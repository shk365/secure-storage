function UploadBar({ uploadingFile, progress }) {
  if (!uploadingFile) return null;

  return (
    <div style={bar}>
      <p>{uploadingFile}</p>

      <div style={progressContainer}>
        <div style={{ ...progressFill, width: `${progress}%` }} />
      </div>

      <p>{progress}%</p>
    </div>
  );
}

const bar = {
  position: "absolute",
  bottom: 20,
  right: 20,
  width: "250px",
  background: "#fff",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "16px",
  zIndex: "999",
  
};

const progressContainer = {
  height: "4px",
  background: "#eee",
  borderRadius: "4px",
  
};

const progressFill = {
  height: "100%",
  background: "#4c6daf",
};

export default UploadBar;