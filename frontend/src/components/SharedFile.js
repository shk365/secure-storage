import { useParams } from "react-router-dom";

import { useEffect, useState } from "react";
import MessageBox from "./MessageBox";

function SharedFile() {

    const { token } = useParams();

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");
    const [message, setMessage] =
        useState("");

    useEffect(() => {

        openSharedFile();

    }, [token]);

    const openSharedFile = async () => {

        try {
            setMessage("Accessing Shared File...");
            const res = await fetch(
                `http://127.0.0.1:5000/file/shared/${token}`
            );

            // INVALID / DISABLED LINK
            if (!res.ok) {

                const data =
                    await res.json();

                setError(
                    data.message ||
                    "Link deactivated"
                );

                setLoading(false);
                setMessage("Link deactivated");

                return;
            }

            // DOWNLOAD FILE
            setMessage("Downloading File...");
            const blob =
                await res.blob();

            const url =
                window.URL.createObjectURL(blob);

            const a =
                document.createElement("a");

            a.href = url;

            document.body.appendChild(a);

            a.click();

            a.remove();

            window.URL.revokeObjectURL(url);

            setLoading(false);
            setMessage("Download Complete");

        } catch (err) {

            console.error(err);

            setError(
                "Unable to access shared file"
            );

            setLoading(false);
        }
    };

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f8fafc",
                padding: "20px"
            }}
        >
            <MessageBox
                message={message}
                onClose={() => setMessage("")}
            />

            <div
                style={{
                    background: "#fff",
                    padding: "40px",
                    borderRadius: "20px",
                    boxShadow:
                        "0 10px 30px rgba(0,0,0,0.08)",
                    textAlign: "center",
                    width: "420px",
                    maxWidth: "95%"
                }}
            >

                {loading ? (

                    <>
                        <h2
                            style={{
                                marginBottom: "12px",
                                color: "#2563eb"
                            }}
                        >
                            Downloading...
                        </h2>

                        <p
                            style={{
                                color: "#64748b"
                            }}
                        >
                            Accessing shared file
                        </p>
                    </>

                ) : error ? (

                    <>
                        <h2
                            style={{
                                marginBottom: "14px",
                                color: "#ef4444"
                            }}
                        >
                            Link Deactivated
                        </h2>

                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "15px"
                            }}
                        >
                            {error}
                        </p>
                    </>

                ) : (

                    <>
                        <h2
                            style={{
                                color: "#10b981"
                            }}
                        >
                            Download Started
                        </h2>
                    </>

                )}

            </div>

        </div>

    );
}

export default SharedFile;