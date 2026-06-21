import React, { useState } from "react";
import "./ConnectServer.css";

function ConnectServer({ onBack, onConnected }) {
  const [url, setUrl] = useState(process.env.REACT_APP_API_URL || "http://localhost:5000");
  const [message, setMessage] = useState("");

 const handleConnect = async () => {
  try {
    const response = await fetch(`${url}/api/ping`);
    if (!response.ok) throw new Error("No responde el servidor");

    await response.json();
    setMessage("Conectado correctamente");
    localStorage.setItem("serverUrl", url);

     if (onConnected) onConnected();
  } catch (error) {
    setMessage("No se pudo conectar al servidor");
  }
};

  return (
    <div className="connect-page">
      <div className="connect-phone">
        <div className="top-bar">
          <button className="back-btn" onClick={onBack}>←</button>
          <h1>Conectar al servidor</h1>
        </div>

        <div className="hero">
          <div className="wifi-icon">📶</div>
          <p>Ingresa la URL de tu servidor Express</p>
        </div>

        <div className="form-card">
          <label>URL del servidor</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:5000"
          />
          <button onClick={handleConnect}>Conectar al servidor</button>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default ConnectServer;