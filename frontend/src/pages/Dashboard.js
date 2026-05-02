import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard({ goToConnect }) {
  const [lectura, setLectura] = useState({
    ph: "--",
    turbidez: "--",
    fecha_creacion: "--",
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarUltimaLectura = async () => {
      try {
        setCargando(true);
        setError("");

        const res = await fetch("http://localhost:5000/api/lecturas/ultima");

        if (!res.ok) {
          throw new Error("No se pudo obtener la lectura");
        }

        const data = await res.json();
        setLectura({
          ph: data.ph ?? "--",
          turbidez: data.turbidez ?? "--",
          fecha_creacion: data.fecha_creacion ?? "--",
        });
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos");
      } finally {
        setCargando(false);
      }
    };

    cargarUltimaLectura();
    const interval = setInterval(cargarUltimaLectura, 5000);

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
          {cargando ? (
            <span>Cargando datos...</span>
          ) : error ? (
            <span>{error}</span>
          ) : (
            <span>Actualizado: {new Date(lectura.fecha_creacion).toLocaleTimeString()}</span>
          )}
        </div>

        <div className="cards-grid">
          <div className="metric-card">
            <h3>pH</h3>
            <div className="metric-value">{lectura.ph}</div>
            <p>Potencial de Hidrógeno</p>
          </div>

          <div className="metric-card">
            <h3>Turbidez</h3>
            <div className="metric-value">{lectura.turbidez}</div>
            <p>Turbidez del agua</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;