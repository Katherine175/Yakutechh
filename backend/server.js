const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json({ message: 'Backend de Yakutech funcionando' });
});

app.get('/api/sensores', (req, res) => {
  res.json({
    ph: 7.2,
    turbidez: 12.4,
    nivelTanque: 85,
    actualizado: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});