import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../index.css";

function SharedFiles() {
    const [files, setFiles] = useState([]);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [sortBy, setSortBy] = useState("latest");
    const [menuOpen, setMenuOpen] = useState(null);
    const [publicFiles, setPublicFiles] = useState([]);
    const menuRef = useRef(null);

    useEffect(() => {
        fetchShared();
        fetchPublicShared();

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 🔹 Fetch shared files
    const fetchShared = async () => {
        try {
            const res = await axios.get(
                "http://127.0.0.1:5000/file/shared",
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
    const fetchPublicShared = async () => {

        try {

            const res = await axios.get(
                "http://127.0.0.1:5000/file/public-shared",
                {
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setPublicFiles(res.data.files);

        } catch (err) {

            console.error(err);

        }
    };

    // 🔹 Download
    const handleDownload = async (cid) => {
        try {
            const res = await axios.post(
                "http://127.0.0.1:5000/file/download",
                { cid },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "file");
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            {/* SEARCH */}
            <div style={{ textAlign: "center" }}>
                <input
                    className="searchBar"
                    type="text"
                    placeholder="Search files..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div style={{ padding: "16px 0px 2px 10px", background: "white", gap: "10px", display: "flex" }}>
                <select style={{ fontSize: "18px", border: "0px" }} className="sortBySelect" onChange={(e) => setSortBy(e.target.value)}>
                    <option value="latest">Latest</option>
                    <option value="name">Name</option>
                    <option value="size">Size</option>
                </select>
                <button title="All Files" className="fileTypeFilterBtn" onClick={() => setFilterType("all")}>ALL</button>
                <button title="Images" className="fileTypeFilterBtn" onClick={() => setFilterType("image")}>IMAGES</button>
                <button title="PDF" className="fileTypeFilterBtn" onClick={() => setFilterType("pdf")}>PDF</button>
            </div>
            {/* FILE GRID */}
            <div style={container}>
                {files.length === 0 ? (
                    <p>No shared files</p>
                ) : (
                    <div style={grid}>
                        {files
                            .filter((file) =>
                                file.filename.toLowerCase().includes(search.toLowerCase())
                            )
                            .filter((file) => {
                                if (filterType === "all") return true;
                                if (filterType === "image")
                                    return file.file_type?.startsWith("image");
                                if (filterType === "pdf")
                                    return file.file_type === "application/pdf";
                                return true;
                            })
                            .sort((a, b) => {
                                if (sortBy === "name")
                                    return a.filename.localeCompare(b.filename);
                                return new Date(b.time) - new Date(a.time);
                            })
                            .map((file) => (
                                <div key={file.id} className="fileCard">
                                    <div className="fileContent">
                                        <div className="fileImage">📄</div>

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <p className="fileName">{file.filename}</p>

                                            <button

                                                style={{
                                                    background: "white",
                                                    border: "0px",
                                                    borderRadius: "20px",
                                                    marginBottom: "0px",
                                                    paddingBottom: "0px",
                                                    fontSize: "15px",
                                                    cursor: "pointer"
                                                }}
                                                onClick={() =>
                                                    setMenuOpen(
                                                        menuOpen === file.id ? null : file.id
                                                    )
                                                }
                                            >
                                                ⋮
                                            </button>
                                        </div>

                                        {/* OWNER INFO */}
                                        <p style={{ fontSize: "12px", color: "#666" }}>
                                            Shared by: {file.owner}
                                        </p>

                                        {menuOpen === file.id && (
                                            <div ref={menuRef} style={dropdown}>
                                                <div onClick={() => handleDownload(file.cid)}>
                                                    Download
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* QUICK ACTIONS */}
                                    <div className="overlayIcons">
                                        <button title="Download" className="iconButton" onClick={() => handleDownload(file.cid)}>
                                            ⬇️
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* SAME STYLES */
const container = {
    background: "#fff",
    padding: "5px 10px 10px 10px",
    position: "relative",
};

const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "10px",
};

const dropdown = {
    left: "120px",
    top: "50px",
    position: "absolute",
    width: "150px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    zIndex: 1000,
    cursor: "pointer",
};

export default SharedFiles;