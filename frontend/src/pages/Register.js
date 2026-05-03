import React, { useState } from "react";
import axios from "axios";

function Register({ onSwitch }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://127.0.0.1:5000/auth/register",
        { username, password }
      );

      setMessage("Registered successfully ✅");

      // switch to login
      onSwitch();
    } catch (err) {
      console.log(err.response?.data);
      setMessage("User already exists ❌");
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2>Register</h2>

        <form onSubmit={handleRegister}>
          <input
            style={input}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            style={input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" style={button}>
            Register
          </button>
        </form>

        <p style={{ marginTop: "10px", textAlign: "Center" }}> {message} </p>

        <p style={{ marginTop: "10px", textAlign: "Center" }}>
          Already have an account?{" "}
          <span style={link} onClick={onSwitch}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const container = {
  display: "flex",
  height: "100vh",
  justifyContent: "center",
  alignItems: "center",
  background: "#f5f6fa",
};

const card = {
  background: "white",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  width: "300px",
};

const input = {
  width: "100%",
  padding: "10px",
  margin: "10px 0px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const button = {
  width: "100%",
  padding: "10px",
  background: "#4c6daf",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const link = {
  color: "#4c6daf",
  cursor: "pointer",
  fontWeight: "bold",
};

export default Register;