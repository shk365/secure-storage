import React, { useEffect, useState } from "react";
import axios from "axios";

function Activity() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://127.0.0.1:5000/file/activity",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={container}>
      <h1>Activity Logs</h1>

      {logs.length === 0 ? (
        <p>No activity yet</p>
      ) : (
        logs.map((log, i) => (
          <div key={i} style={logStyle(true)}> {}
            <strong >{log.action}</strong>  ({log.filename})
            <br />
            <small>{log.time}</small>
          </div>
        ))
      )}
    </div>
  );
}

const container = {
  background: "#ffffff",
  padding: "20px",
  margin: "0px",
};

const logStyle = (dark) => ({
  padding: "5px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px"
});

export default Activity;