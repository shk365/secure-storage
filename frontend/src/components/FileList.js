import React, { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import "../index.css";
import { QRCodeCanvas } from "qrcode.react";

function FileList() {
  const { refreshTrigger } = useOutletContext();
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [shareEnabled, setShareEnabled] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [isOn, setIsOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [emails, setEmails] = useState("");
  const [peopleModal, setPeopleModal] = useState(false);
  const menuRef = useRef(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchFiles();

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null); // close menu
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, [refreshTrigger]);

  const handleDownload = async (cid) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://127.0.0.1:5000/file/download",
        { cid },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const contentDisposition = res.headers["content-disposition"];
      console.log(res.headers);


      let filename = "file";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)/);
        if (match?.[1]) {
          filename = decodeURIComponent(match[1]).trim();
        }
      }
      console.log("HEADER:", contentDisposition);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:5000/file/delete",
        { id: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchFiles(); // refresh FileList
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleShareLink = async (fileId) => {
    setSelectedFileId(fileId);

    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/file/share/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setShareLink(res.data.url);
      setShareOpen(true);

    } catch (err) {
      console.error(err);
    }
  };

  /* Toggle Sharing */
  const toggleShare = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/file/toggle-share",
        { file_id: selectedFileId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setShareEnabled(res.data.enabled);

      if (res.data.enabled) {
        setShareLink(res.data.url);
      } else {
        setShareLink("");
      }
    } catch (err) {
      console.error(err);
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

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Link copied!");
  };

  const copyQR = async () => {
    const canvas = document.querySelector("canvas");

    canvas.toBlob(async (blob) => {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      alert("QR copied!");
    });
  };

  const printQR = () => {
    const canvas = document.querySelector("canvas");
    const dataUrl = canvas.toDataURL();

    const win = window.open();
    win.document.write(`<img src="${dataUrl}" />`);
    win.print();
  };

  const submitSharePeople = async () => {
    const usersList = emails.split(",").map(e => e.trim());

    await axios.post(
      "http://127.0.0.1:5000/file/share-with",
      {
        file_id: selectedFileId,
        usernames: usersList
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    alert("Shared!");
  };

  const openSharePeople = (fileId) => {
    setSelectedFileId(fileId);
    setPeopleModal(true);
  };

  const toggleStar = async (fileId) => {
    try {
      await axios.post(
        "http://127.0.0.1:5000/file/star",
        { id: fileId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchFiles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = (fileId) => {
    const newName = prompt("Enter new name:");
    if (!newName) return;

    // (You don’t have backend route yet)
    console.log("Rename:", fileId, newName);
  };

  const openDetails = (file) => {
    const formatSize = (bytes) => {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };
    setSelectedFile(file);
    setDetailsOpen(true);
  };



  return (
    <div>
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
      <div
        style={container}>
        {files.length === 0 ? (
          <p>No files uploaded yet</p>
        ) : (
          <div>

            <div style={{}}>
              <div style={grid}>
                {files.filter((file) =>
                  file.filename.toLowerCase().includes(search.toLowerCase())
                ).filter((file) => {
                  if (filterType === "all") return true;
                  if (filterType === "image") return file.file_type?.startsWith("image");
                  if (filterType === "pdf") return file.file_type === "application/pdf";
                  return true;
                }).sort((a, b) => {
                  if (sortBy === "name") return a.filename.localeCompare(b.filename);
                  if (sortBy === "size") return b.file_size - a.file_size;
                  if (sortBy === "latest") return new Date(b.created_at) - new Date(a.created_at);
                  return new Date(b.created_at) - new Date(a.created_at);
                }).map((file) => (
                  <div
                    key={`${file.cid}-${file.filename}`}
                    className="fileCard">

                    <div className="fileContent">

                      <div className="fileImage">📄</div>

                      <div style={{ display: "flex", justifyContent: "space-between" }}>

                        <p className="fileName" title={file.filename}>{file.filename}</p>
                        <button style={{
                          background: "white",
                          border: "0px",
                          borderRadius: "20px",
                          marginBottom: "0px",
                          paddingBottom: "0px",
                          fontSize: "15px",
                          cursor: "pointer"
                        }}
                          onClick={() => setMenuOpen(menuOpen === file.id ? null : file.id)}>
                          ⋮
                        </button>

                      </div>


                      {menuOpen === file.id && (
                        <div ref={menuRef} style={dropdown}>
                          <div
                            className="dropDownMenuItems"
                            onClick={() => {
                              handleDownload(file.cid);
                              setMenuOpen(null);
                            }
                            }>
                            Download
                          </div>
                          <div className="dropDownMenuItems" onClick={() => { handleShareLink(file.id); setMenuOpen(null); }}>Share via Link or QR</div>
                          <div className="dropDownMenuItems" onClick={() => { openSharePeople(file.id); setMenuOpen(null); }}>Share with others</div>
                          <div className="dropDownMenuItems" onClick={() => { toggleStar(file.id); setMenuOpen(null); }}>Add to Starred</div>
                          <div className="dropDownMenuItems" onClick={() => { handleRename(file.id); setMenuOpen(null); }}>Rename</div>
                          <div className="dropDownMenuItems" onClick={() => { openDetails(file); setMenuOpen(null); }}>Details</div>
                          <div className="dropDownMenuItems" onClick={() => { handleDelete(file.id); setMenuOpen(null); }}>Move to Bin</div>
                        </div>
                      )}


                      {peopleModal && (
                        <div style={modalOverlay}>
                          <div style={modal}>
                            {/* CLOSE */}
                            <div style={{ textAlign: "right", marginBottom: "8px", paddingRight: "3px" }}>
                              <button title="Close" style={closeBtn} onClick={() => setPeopleModal(false)}>
                                ✕
                              </button>
                            </div>
                            <h3 className="fileNameInDialogBox" >Share {file.filename} with people</h3>

                            <input
                              className="fileNameInDialogBox"
                              placeholder="Enter emails (comma separated)"
                              onChange={(e) => setEmails(e.target.value)}
                            />
                            <br />

                            <button className="shareBtn" onClick={submitSharePeople}>Share</button>

                          </div>
                        </div>
                      )}

                      {detailsOpen && selectedFile && (
                        <div style={modalOverlay}>
                          <div style={modal}>

                            {/* CLOSE */}
                            <div style={{ textAlign: "right" }}>
                              <button style={closeBtn} onClick={() => setDetailsOpen(false)}>
                                ✕
                              </button>
                            </div>

                            <h2 style={{ marginBottom: "10px" }}>File Details</h2>

                            <div style={detailsRow}>
                              <strong>Name:</strong> {selectedFile.filename}
                            </div>

                            <div style={detailsRow}>
                              <strong>Type:</strong> {selectedFile.file_type || "Unknown"}
                            </div>

                            <div style={detailsRow}>
                              <strong>Size:</strong> {(selectedFile.file_size / 1024).toFixed(2)} KB
                            </div>

                            <div style={detailsRow}>
                              <strong>Uploaded:</strong>{" "}
                              {new Date(selectedFile.created_at).toLocaleString()}
                            </div>

                            <div style={detailsRow}>
                              <strong>CID:</strong>
                              <div style={cidBox}>{selectedFile.cid}</div>
                              <button
                                className="copyBtn"
                                onClick={() => navigator.clipboard.writeText(selectedFile.cid)}
                              >
                                Copy CID
                              </button>
                            </div>

                          </div>
                        </div>
                      )}

                    </div>

                    <div className="overlayIcons">
                      <button className="iconButton" title="Download" onClick={() => handleDownload(file.cid)}>⬇️</button>
                      <button className="iconButton" title="Move to Bin" onClick={() => handleDelete(file.id)}>🗑️</button>
                      <button className="iconButton" title="Share" onClick={() => handleShareLink(file.id)}>🔁</button>
                    </div>
                    {shareOpen && (
                      <div style={modalOverlay}>
                        <div style={modal}>
                          {/* CLOSE */}
                          <div style={{ textAlign: "right", marginBottom: "8px", paddingRight: "3px" }}>
                            <button title="Close" style={closeBtn} onClick={() => setShareOpen(false)}>
                              ✕
                            </button>
                          </div>
                          {/* TOGGLE */}
                          <div style={row}>
                            <span style={{
                              fontSize: "22px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              paddingRight: "8px"
                            }} title={file.filename}> Sharing {file.filename}</span>

                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={shareEnabled}
                                onChange={() => toggleShare()}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          {/* LINK */}
                          {shareEnabled && (
                            <>
                              <div style={linkBox}>
                                <input value={shareLink} readOnly style={linkInput} />
                                <button title="Copy Link" className="copyBtn" onClick={copyLink}>Copy</button>
                              </div>

                              {/* QR */}
                              <div style={qrContainer}>
                                <QRCodeCanvas value={shareLink} size={250} />

                                <div style={qrButtons}>
                                  <button title="Copy QR" className="copyBtn" onClick={copyQR}>Copy</button>
                                  <button title="Print QR" className="copyBtn" onClick={printQR}>Print</button>
                                </div>
                              </div>
                            </>
                          )}

                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div >
          </div >
        )}
      </div >
    </div>
  );
}

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

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modal = {
  background: "#fff",
  padding: "0 0 20px 20px",
  borderRadius: "10px",
  width: "500px",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
  paddingRight: "20px",
};

const linkBox = {
  display: "flex",
  gap: "8px",
  marginBottom: "10px",
  paddingRight: "20px",
};

const linkInput = {
  flex: 1,
  padding: "5px",
  border: "1px solid #d5d5d5",
  borderRadius: "5px",
  fontSize: "16px",
};

const dropdown = {
  position: "absolute",
  left: 120,
  top: 60,
  width: "200px",
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "10px 0px",
  gap: "10px",
  zIndex: 1005,
  display: "flex",
  flexDirection: "column",
  cursor: "pointer"
};

const qrContainer = {
  position: "relative",
  textAlign: "center",
  paddingRight: "20px",
};

const qrButtons = {
  position: "absolute",
  bottom: "120px",
  left: "50%",
  paddingRight: "20px",
  transform: "translateX(-50%)",
  display: "flex",
  gap: "15px",
};

const closeBtn = {
  margin: "10px",
  padding: "5px",
  background: "#ffffff",
  border: "0px solid ",
  color: "black",
  cursor: "pointer",
  fontSize: "24px"
};

const detailsRow = {
  marginBottom: "10px",
  fontSize: "16px",
};

const cidBox = {
  display: "flex",
  gap: "8px",
  marginBottom: "10px",
  paddingRight: "20px",
};

export default FileList;