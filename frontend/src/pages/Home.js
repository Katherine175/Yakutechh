import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState({
    ph: "--",
    turbidez: "--",
    nivelTanque: "--",
    actualizado: "--",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sensores");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <div className="phone">
        <div className="notch"></div>

        <div className="icon">💧</div>
        <h1>Yakutech</h1>
        <p className="subtitle">Transformando la lluvia en vida</p>
        <p className="small">Conectado a ESP32 vía WiFi</p>

        <div className="chips">
          <span>pH en tiempo real</span>
          <span>Turbidez</span>
          <span>Niveles de tanque</span>
        </div>

        <div className="card">
          <h2>Estado actual</h2>
          <p><strong>pH:</strong> {data.ph}</p>
          <p><strong>Turbidez:</strong> {data.turbidez}</p>
          <p><strong>Nivel del tanque:</strong> {data.nivelTanque}%</p>
          <p><strong>Actualizado:</strong> {data.actualizado}</p>
        </div>

        <button className="connect-btn">Conectar dispositivo</button>
        <p className="footer">Asegúrate de que el WiFi esté activo</p>
      </div>
    </div>
  );
}

export default App;