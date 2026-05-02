import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard({ goToConnect }) {
  const [lectura, setLectura] = useState({
    ph: "--",
    turbidez: "--",
    fecha_creacion: "--",
  });

  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [tabActiva, setTabActiva] = useState("inicio");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");

        const serverUrl =
          localStorage.getItem("serverUrl") || "http://localhost:5000";

        const [resUltima, resHistorial] = await Promise.all([
          fetch(`${serverUrl}/api/lecturas/ultima`),
          fetch(`${serverUrl}/api/lecturas`),
        ]);

        if (!resUltima.ok) {
          throw new Error("No se pudo obtener la última lectura");
        }

        if (!resHistorial.ok) {
          throw new Error("No se pudo obtener el historial");
        }

        const ultima = await resUltima.json();
        const historialData = await resHistorial.json();

        setLectura({
          ph: ultima.ph ?? "--",
          turbidez: ultima.turbidez ?? "--",
          fecha_creacion: ultima.fecha_creacion ?? "--",
        });

        setHistorial(historialData);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
    const interval = setInterval(cargarDatos, 5000);
    return () => clearInterval(interval);
  }, []);

  const obtenerEstado = () => {
    const ph = Number(lectura.ph);
    const turbidez = Number(lectura.turbidez);

    if (isNaN(ph) || isNaN(turbidez)) return { texto: "DESCONOCIDA", clase: "unknown" };

    if (ph >= 6.5 && ph <= 8.5 && turbidez < 1) {
      return { texto: "AGUA APTA", clase: "apta" };
    }

    if (
      (ph >= 6.0 && ph < 6.5) ||
      (ph > 8.5 && ph <= 9.0) ||
      (turbidez >= 1 && turbidez <= 4)
    ) {
      return { texto: "OBSERVACIÓN", clase: "observacion" };
    }

    return { texto: "NO APTA", clase: "noapta" };
  };

  const estado = obtenerEstado();

  return (
    <div className="dashboard-page">
      <div className="dashboard-phone">
        <div className="dashboard-top">
          <div>
            <h1>Yakutech</h1>
            <p>Sistema de Filtración de Agua</p>
          </div>
          <button className="connect-btn" onClick={goToConnect}>
            Conectar
          </button>
        </div>

        <div className="dashboard-content">
          {tabActiva === "inicio" && (
            <>
              <div className={`status-card ${estado.clase}`}>
                <div className="status-title-row">
                  <div className="status-icon">✓</div>
                  <div>
                    <h2>{estado.texto}</h2>
                    <p>
                      {cargando
                        ? "Cargando..."
                        : error
                        ? error
                        : "Todos los parámetros dentro del rango óptimo"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="info-row">
                {cargando ? (
                  <span>Cargando datos...</span>
                ) : error ? (
                  <span>{error}</span>
                ) : (
                  <span>
                    Actualizado:{" "}
                    {lectura.fecha_creacion !== "--"
                      ? new Date(lectura.fecha_creacion).toLocaleTimeString()
                      : "--"}
                  </span>
                )}
              </div>

              <div className="cards-grid">
                <div className="metric-card ph-card">
                  <div className="metric-badge">⚗️</div>
                  <div className="metric-value">{lectura.ph}</div>
                  <div className="metric-unit">pH</div>
                  <p>Potencial de Hidrógeno</p>
                  <small>Óptimo: 6.5 - 8.5</small>
                </div>

                <div className="metric-card turbidez-card">
                  <div className="metric-badge">💧</div>
                  <div className="metric-value">{lectura.turbidez}</div>
                  <div className="metric-unit">NTU</div>
                  <p>Turbidez del agua</p>
                  <small>Óptimo: &lt; 1 NTU</small>
                </div>
              </div>

              <div className="history-preview">
                <div className="section-title">
                  <h3>Historial</h3>
                  <button onClick={() => setTabActiva("historial")}>Ver todo</button>
                </div>

                {historial.length === 0 ? (
                  <p className="empty-text">No hay lecturas registradas</p>
                ) : (
                  <div className="history-list">
                    {historial.slice(0, 3).map((item, index) => (
                      <div className="history-item" key={item.id || index}>
                        <p><strong>pH:</strong> {item.ph ?? "--"}</p>
                        <p><strong>Turbidez:</strong> {item.turbidez ?? "--"}</p>
                        <p className="history-date">
                          {item.fecha_creacion
                            ? new Date(item.fecha_creacion).toLocaleString()
                            : "--"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {tabActiva === "historial" && (
            <div className="history-full">
              <div className="section-title">
                <h3>Historial completo</h3>
                <button onClick={() => setTabActiva("inicio")}>Volver</button>
              </div>

              {historial.length === 0 ? (
                <p className="empty-text">No hay lecturas registradas</p>
              ) : (
                <div className="history-list">
                  {historial.map((item, index) => (
                    <div className="history-item" key={item.id || index}>
                      <p><strong>pH:</strong> {item.ph ?? "--"}</p>
                      <p><strong>Turbidez:</strong> {item.turbidez ?? "--"}</p>
                      <p className="history-date">
                        {item.fecha_creacion
                          ? new Date(item.fecha_creacion).toLocaleString()
                          : "--"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tabActiva === "ajustes" && (
            <div className="settings-card">
              <h3>Ajustes</h3>
              <p>Próximamente...</p>
            </div>
          )}
        </div>

        <div className="bottom-nav">
          <button
            className={tabActiva === "inicio" ? "active" : ""}
            onClick={() => setTabActiva("inicio")}
          >
            Inicio
          </button>
          <button
            className={tabActiva === "historial" ? "active" : ""}
            onClick={() => setTabActiva("historial")}
          >
            Historial
          </button>
          <button
            className={tabActiva === "ajustes" ? "active" : ""}
            onClick={() => setTabActiva("ajustes")}
          >
            Ajustes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;