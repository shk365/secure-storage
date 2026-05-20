import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import useAutoLogout from "./useAutoLogout";
import axios from "axios";
import MessageBox from "./MessageBox";
import "../styles/Layout.css";


  

function Layout({ onUploadComplete, setUploadingFile, setProgress, children }) {
  console.log("Layout rendering");
  const username = localStorage.getItem("username");
  console.log("Username:", username);
  const [message, setMessage] = useState("");
  useAutoLogout(setMessage);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [files, setFiles] = useState([]);
  const menu = [
    { path: "/files", icon: "📁", name: "My Files" },
    { path: "/shared", icon: "👥", name: "Shared Files" },
    { path: "/starred", icon: "⭐", name: "Starred" },
    { path: "/activity", icon: "🕒", name: "Activity" },
    { path: "/bin", icon: "🗑️", name: "Bin" },
    { path: "/ipfs-status", icon: "📊", name: "IPFS Status" },
    { path: "/ipfs-peers", icon: "👥", name: "IPFS Peers" },
  ];
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [dragging, setDragging] = useState(false);
  const handleUpload = async (file) => {
    if (!file) return;

    setUploadingFile(file.name);
    setProgress(0);
    setMessage("Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/file/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          },
        }
      );

      setProgress(100);

      onUploadComplete();

      setTimeout(() => {
        setUploadingFile(null);
        setProgress(0);
      }, 100);
      setRefreshTrigger(prev => prev + 1);
      setMessage("Upload Complete");
    } catch (err) {
      console.error(err);
      setUploadingFile(null);
      setMessage("Upload Failed");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 🔥 Only hide if actually leaving container
    if (e.currentTarget.contains(e.relatedTarget)) return;

    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);

    const file = e.dataTransfer.files[0];

    if (file) {
      handleUpload(file);
    }
  };

  const shareWithUsers = async () => {
    const res = await axios.post(
      "/file/share-with",
      {
        file_id: selectedFile,
        usernames: input.split(",")
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessage(`Shared with: ${res.data.shared_with.join(", ")}`);
  };

  return (
    <div>
      <MessageBox message={message} onClose={() => setMessage("")} />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        style={{ position: "relative" }}
      >
        {dragging && (
          <div style={overlay}>
            Drop here to Upload it
          </div>
        )}
        {children}  {/* UploadBar fixed at bottom */}
        <div style={wrapper}>

          {/* TOP BAR */}
          <div style={topbar}>
            <h1 style={{ margin: 0 }}>Secure Storage</h1>

            <div style={{ display: "flex", gap: "10px" }}>


              <div className="user-avatar" title={username}>
                {username?.charAt(0).toUpperCase()}

              </div>

              <button
                className="logoutBtn"
                title="Logout"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.reload();
                }}
              >
                ↩ Logout
              </button>
            </div>
          </div>

          <div style={main}>
            {/* SIDEBAR */}
            <div style={sidebar(collapsed)}>
              <input
                type="file"
                id="fileInput"
                hidden
                onChange={(e) => handleUpload(e.target.files[0])}
              />
              <button
                style={newBtn}
                onClick={() => document.getElementById("fileInput").click()}
              >+ Add / Upload
              </button>

              {menu.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    ...link,
                    background:
                      location.pathname === item.path ? "#e8f0fe" : "transparent",
                  }}
                >
                  {item.icon} {!collapsed && item.name}
                </Link>
              ))}

              <button
                style={collapseBtn}
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? "➡️" : "⬅️"}
              </button>
            </div>

            {/* CONTENT */}
            <div style={content}>
              <Outlet context={{ refreshTrigger }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "absolute",
  margin: "10px",
  color: "#4c6daf",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(76,109,175,0.2)",
  border: "2px solid #4c6daf",
  borderRadius: "30px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "20px",
  fontWeight: "bold",
  zIndex: 999,
  pointerEvents: "none",
};

const wrapper = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
};

const topbar = {
  height: "50px",
  background: "#ffffff",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 20px",
};

const main = {
  display: "flex",
  flex: 1,
};

const sidebar = (collapsed) => ({
  width: collapsed ? "70px" : "180px",
  position: "sticky",
  top: 0,
  height: "100vh",
  overflowY: "auto",
  overflowX: "hidden",
  flexShrink: 0,
  background: "#ffffff",
  borderRight: "1px solid #e5e7eb",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  overflow: "hidden",
});

const newBtn = {
  padding: "10px",
  borderRadius: "20px",
  background: "#e8f0fe",
  border: "none",
  cursor: "pointer",
  fontWeight: "Bold",
  fontSize: "18px",
};

const link = {
  padding: "8px",
  borderRadius: "20px",
  textDecoration: "none",
  color: "#111",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "16px",
};

const content = {
  flex: "1",
  background: "#f8fafc",
};

const iconBtn = {
  background: "#f1f3f4",
  border: "none",
  padding: "5px",
  borderRadius: "50%",
  cursor: "pointer",
  fontSize: "10px"
};

const collapseBtn = {
  marginTop: "auto",
  background: "none",
  border: "none",
  cursor: "pointer",
};

export default Layout;


