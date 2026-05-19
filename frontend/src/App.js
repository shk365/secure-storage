import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FilesPage from "./pages/FilesPage";
import ActivityPage from "./pages/ActivityPage";
import BinPage from "./pages/BinPage";
import UploadPage from "./pages/UploadPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SharedFiles from "./components/SharedFiles";
import SharedFile from "./components/SharedFile";
import StarredPage from "./pages/StarredPage";
import IPFSStatus from "./pages/IPFSStatus";
import IPFSPeers from "./pages/IPFSPeers";
console.log("App rendering");


function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isRegister, setIsRegister] = useState(false);

  if (!token) {
    return isRegister ? (
      <Register onSwitch={() => setIsRegister(false)} />
    ) : (
      <Login onLogin={setToken} onSwitch={() => setIsRegister(true)} />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Navigate to="/files" />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="/shared" element={<SharedFiles />} />
          <Route
            path="/shared/:token"
            element={<SharedFile />}
          />
          <Route path="/starred" element={<StarredPage />} />
          <Route path="bin" element={<BinPage />} />
          <Route path="/ipfs-status" element={<IPFSStatus />} />
          <Route path="/ipfs-peers" element={<IPFSPeers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;