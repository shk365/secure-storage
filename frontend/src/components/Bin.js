import React, { useState, useEffect } from "react";
import axios from "axios";

function Bin() {
    const [files, setFiles] = useState([]);

    const fetchBin = async () => {
        try {
            const res = await axios.get(
                "http://127.0.0.1:5000/file/bin",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setFiles(res.data.files);
        } catch (err) {
            console.error(err);
        }
    };

    const restore = async (id) => {
        await axios.post("http://127.0.0.1:5000/file/restore",
            { id },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        fetchBin();
    };

    useEffect(() => {
        fetchBin();
        const interval = setInterval(() => {
            setFiles((prev) => [...prev]); // force re-render
        }, 60000); // every 1 min
        return () => clearInterval(interval);
    }, []);

    const getDaysLeft = (deletedAt) => {
        if (!deletedAt) return null;

        const deletedDate = new Date(deletedAt);
        const expiryDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        const diff = expiryDate - new Date();

        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        return days > 0 ? days : 0;
    };

    const handlePermanentDelete = async (id) => {
        const confirmDelete = window.confirm(
            "⚠️ This file will be permanently deleted and cannot be recovered. Continue?"
        );

        if (!confirmDelete) return;

        try {
            await axios.post(
                "http://127.0.0.1:5000/file/permanent-delete",
                { id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            fetchBin();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEmptyBin = async () => {
        const confirmDelete = window.confirm(
            "⚠️ This will permanently delete ALL files in Bin. Continue?"
        );

        if (!confirmDelete) return;

        try {
            await axios.post(
                "http://127.0.0.1:5000/file/empty-bin",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            fetchBin(); // refresh UI
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div
            style={{ padding: "20px", background: "white" }}
        >
            {files.length === 0 ? (
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "30px" }}>🗑️</p>
                    <p style={{ fontSize: "15px" }}>Empty Bin</p>
                </div>
            ) : (
                <div>
                    <div>
                        <div>   
                            <div style={{textAlign:"right", padding:"20px"}}>
                                <button
                                    title="Empty Bin (Delete Forever)"
                                    style={{
                                        ...deleteBtn,
                                        opacity: files.length === 0 ? 0.5 : 1,
                                        cursor: files.length === 0 ? "not-allowed" : "pointer",
                                    }}
                                    disabled={files.length === 0}
                                    onClick={handleEmptyBin}
                                >
                                    Empty Bin
                                </button>
                            </div>
                        </div>
                    </div>
                    <table style={table}>
                        <thead>
                            <tr>
                                <th style={th}>File Name</th>
                                <th style={th}>Data Binned</th>
                                <th style={th}>Deleting in</th>
                                <th style={th}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {files.map((f) => (
                                <tr key={f.id} style={tr}>
                                    <td title={f.filename} style={td}>📄 {f.filename}</td>

                                    <td style={td}>
                                        {f.deleted_at
                                            ? new Date(f.deleted_at).toLocaleString()
                                            : "-"}
                                    </td>

                                    <td style={td}>
                                        {getDaysLeft(f.deleted_at)} days
                                    </td>

                                    <td style={td}>
                                        <div>
                                            <button
                                                style={restoreBtn}
                                                title="Restore"
                                                onClick={() => restore(f.id)}
                                            >
                                                ♻️
                                            </button>
                                            <button
                                                style={restoreBtn}
                                                title="Permanently Delete"
                                                onClick={() => handlePermanentDelete(f.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

    );
}


const table = {
    width: "100%",
    borderCollapse: "collapse",
};

const th = {
    textAlign: "left",
    padding: "5px",
    borderBottom: "2px solid #ddd",
    fontSize: "16px",
};

const tr = {
    borderBottom: "1px solid #eee",
};

const td = {
    padding: "5px",
    fontSize: "14px",
};

const restoreBtn = {
    padding: "4px",
    background: "white",
    color: "white",
    border: "1px solid #d8d8d8",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "5px"
};

const deleteBtn = {
    marginBottom: "5px",
    padding: "5px 10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "right"
};

export default Bin;