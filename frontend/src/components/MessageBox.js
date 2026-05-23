import { useEffect } from "react";

function MessageBox({ message, onClose }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div style={box}>
      {message}
    </div>
  );
}

const box = {
  position: "fixed",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  background: "#323232",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: "8px",
  zIndex: 99999,
};

export default MessageBox;