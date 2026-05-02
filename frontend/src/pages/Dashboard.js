import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard({ goToHistory, goToSettings, goToConnect }) {
  const [data, setData] = useState({
    ph: "--",
    turbidez: "--",
    actualizado: "--",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sensores");
        const json = await res.json();
        setData({
          ph: json.ph ?? "--",
          turbidez: json.turbidez ?? "--",
          actualizado: json.actualizado ?? "--",
        });
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-phone">
        <div className="dashboard-header">
          <div>
            <h1>Yakutech</h1>
            <p>Sistema de Filtración de Agua</p>
          </div>
          <button className="connect-btn" onClick={goToConnect}>
            Conectar
          </button>
        </div>

        <div className="status-card">
          <h2>AGUA APTA</h2>
          <p>Todos los parámetros dentro del rango óptimo</p>
        </div>

        <div className="info-row">
          <span>Actualizado: {data.actualizado}</span>
        </div>

        <div className="cards-grid">
          <div className="metric-card">
            <h3>pH</h3>
            <div className="metric-value">{data.ph}</div>
            <p>Potencial de Hidrógeno</p>
          </div>

          <div className="metric-card">
            <h3>Turbidez</h3>
            <div className="metric-value">{data.turbidez}</div>
            <p>Turbidez del agua</p>
          </div>
        </div>

        <div className="bottom-actions">
          <button onClick={goToHistory}>Historial</button>
          <button onClick={goToSettings}>Ajustes</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;