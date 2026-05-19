import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin, onSwitch }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();   // ✅ prevent page reload
        try {
            const res = await axios.post(
                "http://127.0.0.1:5000/auth/login",
                { username, password }
            );

            const token = res.data.token;

            // save token
            localStorage.setItem("token", token);
            localStorage.setItem("username", res.data.username);
            console.log("Login successful, token stored:", token, "Username:", res.data.username);
            // notify app
            onLogin(token);

        } catch (err) {
            console.log(err.response?.data);
            setMessage("Invalid credentials ❌");
        }
    };

    return (
        <div style={container}>
            <div style={card}>
                <h2>Login</h2>
                <form>
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

                    <button style={button} onClick={handleLogin}>
                        Login
                    </button>
                </form>
                <p>{message}</p>
                <p style={{ marginTop: "10px", textAlign: "Center" }}>
                    New user?{" "}
                    <span style={link} onClick={onSwitch}>
                        Register
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
    margin: "10px 0",
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

export default Login;