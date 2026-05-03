import React, { useState } from "react";
import axios from "axios";


function Upload() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [dragging, setDragging] = useState(false);

    const handleUpload = async (selectedFile) => {
        const uploadFile = selectedFile || file;

        if (!uploadFile) {
            setMessage("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append("file", uploadFile);

        try {
            const res = await axios.post(
                "http://127.0.0.1:5000/file/upload",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setMessage("Uploaded successfully ✅");
            console.log(res.data);
        } catch (err) {
            setMessage("Upload failed ❌");
            console.error(err);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);

        const selected = e.dataTransfer.files[0];
        setFile(selected);

        handleUpload(selected);  // ✅ now works
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div style={{
            border: "2px dashed #aaa",
            padding: "40px",
            textAlign: "center",
            borderRadius: "10px",
        }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}>
            <p>Drag & Drop File Here</p>

            <p>or</p>

            <input
                type="file"
                onChange={(e) => {
                    const selected = e.target.files[0];
                    setFile(selected);
                    handleUpload(selected);
                }}
            />

            <button style={button} onClick={handleUpload}>
                Upload
            </button>

            <p>{message}</p>
        </div>
    );
}


const button = {
    marginTop: "15px",
    padding: "5px 10px",
    borderWidth: "1px",
    background: "white",
    color: "black",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "10px"
};

const uploadBox = {
    padding: "12px",
    background: "#eef2ff",

};

export default Upload;