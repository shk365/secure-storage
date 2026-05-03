import React, { useState } from "react";
import Layout from "../components/Layout";
import UploadBar from "../components/UploadBar";
import axios from "axios";

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const fetchFiles = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:5000/file/my-files",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
        }
      );
      setFiles(res.data.files);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div>
      <Layout
        onUploadComplete={fetchFiles}
        setUploadingFile={setUploadingFile}
        setProgress={setProgress}
      >
        <UploadBar uploadingFile={uploadingFile} progress={progress} />
      </Layout>
    </div>
  );
}

export default Dashboard;