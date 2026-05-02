const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/ping", async (req, res) => {
  res.json({ ok: true, mensaje: "Servidor funcionando" });
});

app.get("/api/lecturas/ultima", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM lecturas ORDER BY fecha_creacion DESC LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "No hay lecturas disponibles" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener la última lectura" });
  }
});

app.get("/api/lecturas", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM lecturas ORDER BY fecha_creacion DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener el historial" });
  }
});

app.post("/api/lecturas", async (req, res) => {
  try {
    const { ph, turbidez } = req.body;

    const result = await pool.query(
      "INSERT INTO lecturas (ph, turbidez) VALUES ($1, $2) RETURNING *",
      [ph, turbidez]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al guardar la lectura" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});