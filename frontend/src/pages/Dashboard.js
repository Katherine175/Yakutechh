import React, { useEffect, useMemo, useState } from "react";
import { getServerUrl } from "../config";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
  const [metricaActiva, setMetricaActiva] = useState("ph");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");



// DESPUÉS:
const serverUrl = getServerUrl();

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

    if (isNaN(ph) || isNaN(turbidez)) {
      return { texto: "DESCONOCIDA", clase: "unknown" };
    }

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

  const datosGraficados = useMemo(() => {
    return [...historial]
      .slice()
      .reverse()
      .map((item) => ({
        fecha: item.fecha_creacion
          ? new Date(item.fecha_creacion).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        ph: Number(item.ph),
        turbidez: Number(item.turbidez),
      }))
      .filter((item) => !isNaN(item[metricaActiva]));
  }, [historial, metricaActiva]);

  const valoresValidos = useMemo(() => {
    return historial
      .map((item) => Number(item[metricaActiva]))
      .filter((n) => !isNaN(n));
  }, [historial, metricaActiva]);

  const promedio = valoresValidos.length
    ? (valoresValidos.reduce((a, b) => a + b, 0) / valoresValidos.length).toFixed(2)
    : "--";

  const minimo = valoresValidos.length ? Math.min(...valoresValidos).toFixed(2) : "--";
  const maximo = valoresValidos.length ? Math.max(...valoresValidos).toFixed(2) : "--";

  const etiquetaUnidad = metricaActiva === "ph" ? "pH" : "NTU";
  const tituloMetrica = metricaActiva === "ph" ? "Potencial de Hidrógeno (pH)" : "Turbidez";
  const rangoOptimo =
    metricaActiva === "ph" ? "Rango óptimo: 6.5 - 8.5 pH" : "Rango óptimo: < 1 NTU";

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
                <h3>Historial</h3>
                <button onClick={() => setTabActiva("inicio")}>Volver</button>
              </div>

              <div className="history-tabs">
                <button
                  className={metricaActiva === "ph" ? "active" : ""}
                  onClick={() => setMetricaActiva("ph")}
                >
                  pH
                </button>
                <button
                  className={metricaActiva === "turbidez" ? "active" : ""}
                  onClick={() => setMetricaActiva("turbidez")}
                >
                  Turbidez
                </button>
              </div>

              <div className="chart-card">
                <h4>{tituloMetrica}</h4>
                <p>{rangoOptimo}</p>

                {datosGraficados.length === 0 ? (
                  <p className="empty-text">No hay datos suficientes para mostrar la gráfica</p>
                ) : (
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={datosGraficados}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey={metricaActiva}
                          stroke="#0f62fe"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span>Promedio</span>
                  <strong>
                    {promedio} <small>{etiquetaUnidad}</small>
                  </strong>
                </div>
                <div className="stat-card">
                  <span>Mínimo</span>
                  <strong>
                    {minimo} <small>{etiquetaUnidad}</small>
                  </strong>
                </div>
                <div className="stat-card">
                  <span>Máximo</span>
                  <strong>
                    {maximo} <small>{etiquetaUnidad}</small>
                  </strong>
                </div>
              </div>

              <div className="current-reading-card">
                <h4>Lectura actual</h4>
                <strong>
                  {metricaActiva === "ph" ? lectura.ph : lectura.turbidez}{" "}
                  <small>{etiquetaUnidad}</small>
                </strong>
                <span className="status-pill">
                  {estado.texto === "AGUA APTA" ? "Estable" : estado.texto}
                </span>
              </div>

              <div className="history-full-list">
                <h4>Lecturas recientes</h4>
                {historial.length === 0 ? (
                  <p className="empty-text">No hay lecturas registradas</p>
                ) : (
                  historial.slice(0, 8).map((item, index) => (
                    <div className="recent-item" key={item.id || index}>
                      <span className="recent-time">
                        {item.fecha_creacion
                          ? new Date(item.fecha_creacion).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--"}
                      </span>
                      <div className="recent-bar">
                        <div
                          className="recent-fill"
                          style={{
                            width: `${Math.min(
                              100,
                              metricaActiva === "ph"
                                ? (Number(item.ph) / 14) * 100
                                : (Number(item.turbidez) / 10) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="recent-value">
                        {metricaActiva === "ph"
                          ? `${item.ph ?? "--"} pH`
                          : `${item.turbidez ?? "--"} NTU`}
                      </span>
                    </div>
                  ))
                )}
              </div>
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