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
import StarredPage from "./pages/StarredPage";
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
        <Route path="/" element={<Dashboard         />}>
          <Route index element={<Navigate to="/files" />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="/shared" element={<SharedFiles />} />
          <Route path="/starred" element={<StarredPage />} />
          <Route path="bin" element={<BinPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;