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
const [alertaPH, setAlertaPH] = useState(true);
const [alertaTurbidez, setAlertaTurbidez] = useState(true);
const [alertaTanque, setAlertaTanque] = useState(true);
const [sonidoAlertas, setSonidoAlertas] = useState(false);
const [faqAbierto, setFaqAbierto] = useState(null);

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
        {tabActiva !== "ajustes" ? (
  <div className="dashboard-top">
    <div>
      <h1>Yakutech</h1>
      <p>Sistema de Filtración de Agua</p>
    </div>
    <button className="connect-btn" onClick={goToConnect}>
      Conectar
    </button>
  </div>
) : (
  <div className="ajustes-top">
    <h1>Ajustes</h1>
    <p>Configuración y ayuda del sistema</p>
  </div>
)}

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
  <div className="ajustes-content">

    {/* DISPOSITIVO */}
    <p className="ajustes-section-label">DISPOSITIVO</p>
    <div className="ajustes-card">
      <div className="ajustes-row ajustes-row-between">
        <div className="ajustes-row-left">
          <div className="ajustes-icon ajustes-icon-gray">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M1 6l5 6-5 6"/><path d="M23 6l-5 6 5 6"/></svg>
          </div>
          <div>
            <p className="ajustes-row-title">Sin conexión</p>
            <p className="ajustes-row-sub"><span className="dot-off">●</span> Desconectado</p>
          </div>
        </div>
        <button className="ajustes-conectar-btn" onClick={goToConnect}>Conectar</button>
      </div>
      <div className="ajustes-divider"/>
      <div className="ajustes-row ajustes-row-between">
        <div className="ajustes-row-left">
          <div className="ajustes-icon ajustes-icon-yellow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div>
            <p className="ajustes-row-title">Firmware</p>
            <p className="ajustes-row-sub">ESP32 v2.1.0 — Actualizado</p>
          </div>
        </div>
        <span className="ajustes-chevron">›</span>
      </div>
      <div className="ajustes-divider"/>
      <div className="ajustes-row ajustes-row-between">
        <div className="ajustes-row-left">
          <div className="ajustes-icon ajustes-icon-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <p className="ajustes-row-title">Intervalo de muestreo</p>
            <p className="ajustes-row-sub">Polling cada 3 segundos · GET /api/sensors</p>
          </div>
        </div>
        <span className="ajustes-chevron">›</span>
      </div>
    </div>

    {/* NOTIFICACIONES */}
    <p className="ajustes-section-label">NOTIFICACIONES Y ALERTAS</p>
    <div className="ajustes-card">
      {[
        { icon: "🧪", color: "#7c3aed", label: "Alerta de pH", sub: "Avisa si sale del rango 6.5 – 8.5", val: alertaPH, set: setAlertaPH },
        { icon: "💧", color: "#0ea5e9", label: "Alerta de turbidez", sub: "Avisa si supera 1 NTU", val: alertaTurbidez, set: setAlertaTurbidez },
        { icon: "🌡️", color: "#ef4444", label: "Nivel bajo de tanque", sub: "Avisa cuando baje del 15%", val: alertaTanque, set: setAlertaTanque },
        { icon: "🔔", color: "#f97316", label: "Sonido de alertas", sub: "Activar sonidos del sistema", val: sonidoAlertas, set: setSonidoAlertas },
      ].map((item, i, arr) => (
        <React.Fragment key={item.label}>
          <div className="ajustes-row ajustes-row-between">
            <div className="ajustes-row-left">
              <div className="ajustes-icon" style={{ background: item.color }}>{item.icon}</div>
              <div>
                <p className="ajustes-row-title">{item.label}</p>
                <p className="ajustes-row-sub">{item.sub}</p>
              </div>
            </div>
            <button
              className={`toggle-btn ${item.val ? "toggle-on" : ""}`}
              onClick={() => item.set(!item.val)}
              aria-label={item.label}
            >
              <span className="toggle-thumb"/>
            </button>
          </div>
          {i < arr.length - 1 && <div className="ajustes-divider"/>}
        </React.Fragment>
      ))}
    </div>

    {/* UMBRALES */}
    <p className="ajustes-section-label">UMBRALES DE CALIDAD</p>
    <div className="ajustes-card">
      <p className="umbral-titulo">pH</p>
      <div className="umbral-row">
        <span className="umbral-tag umbral-verde">6.5 – 8.5</span>
        <span className="umbral-tag umbral-amarillo">6.0–6.5 / 8.5–9.0</span>
        <span className="umbral-tag umbral-rojo">{"< 6.0 / > 9.0"}</span>
      </div>
      <div className="ajustes-divider" style={{ margin: "12px 0" }}/>
      <p className="umbral-titulo">Turbidez</p>
      <div className="umbral-row">
        <span className="umbral-tag umbral-verde">{"< 1 NTU"}</span>
        <span className="umbral-tag umbral-amarillo">1 – 4 NTU</span>
        <span className="umbral-tag umbral-rojo">{"> 4 NTU"}</span>
      </div>
      <div className="umbral-leyenda">
        <span className="leyenda-item leyenda-verde">✓ Apta</span>
        <span className="leyenda-item leyenda-amarillo">⚠ Observación</span>
        <span className="leyenda-item leyenda-rojo">✗ No Apta</span>
      </div>
    </div>

    {/* MANTENIMIENTO */}
    <p className="ajustes-section-label">MANTENIMIENTO</p>
    <div className="ajustes-card">
      <div className="ajustes-row ajustes-row-between">
        <div className="ajustes-row-left">
          <div className="ajustes-icon ajustes-icon-cyan">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          </div>
          <div>
            <p className="ajustes-row-title">Estado del filtro</p>
            <p className="ajustes-row-sub">Cambiar cada 30 días</p>
          </div>
        </div>
        <span className="ajustes-chevron">›</span>
      </div>
      <div className="ajustes-divider"/>
      <div className="ajustes-row ajustes-row-between">
        <div className="ajustes-row-left">
          <div className="ajustes-icon ajustes-icon-red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </div>
          <div>
            <p className="ajustes-row-title">Limpiar historial</p>
            <p className="ajustes-row-sub">Borrar datos de los últimos 30 días</p>
          </div>
        </div>
        <span className="ajustes-chevron">›</span>
      </div>
    </div>

    {/* AYUDA */}
    <p className="ajustes-section-label">AYUDA FRECUENTE</p>
    <div className="ajustes-card">
      {[
        { q: '¿Qué significa "AGUA APTA"?', a: 'Significa que los parámetros de pH (6.5–8.5) y turbidez (< 1 NTU) están dentro del rango óptimo para consumo humano.' },
        { q: '¿Con qué frecuencia debo cambiar el filtro?', a: 'Se recomienda cambiar el filtro cada 30 días, o antes si la turbidez supera constantemente 4 NTU.' },
        { q: '¿Qué hago si el agua aparece como "NO APTA"?', a: 'Deja de consumir el agua inmediatamente y revisa el filtro. Si el problema persiste, contacta a un técnico.' },
      ].map((item, i, arr) => (
        <React.Fragment key={i}>
          <div
            className="faq-row"
            onClick={() => setFaqAbierto(faqAbierto === i ? null : i)}
          >
            <span className="faq-pregunta">{item.q}</span>
            <span className="faq-chevron">{faqAbierto === i ? "∧" : "∨"}</span>
          </div>
          {faqAbierto === i && <p className="faq-respuesta">{item.a}</p>}
          {i < arr.length - 1 && <div className="ajustes-divider"/>}
        </React.Fragment>
      ))}
    </div>

    <div style={{ height: 20 }}/>
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