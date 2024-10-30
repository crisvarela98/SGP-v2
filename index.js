const express = require('express');
const path = require('path');
const dataHandler = require('./api/dataHandler');
const descargarBase = require('./api/descargarbase'); // Archivo para descargar datos
const subirBase = require('./api/subirbase'); // Archivo para subir datos

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Configuración de rutas estáticas
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use('/json', express.static(path.join(__dirname, 'json')));
app.use('/data', express.static(path.join(__dirname, 'data')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Rutas para manejo de datos
app.post('/data', dataHandler.saveData);
app.get('/data/:type', dataHandler.loadData);

// Rutas para descargar y subir la base de datos en /api
app.get('/api/descargarbase', async (req, res) => {
    await descargarBase(req, res); // Asegura que descargarBase maneje la solicitud
});

app.post('/api/subirbase', async (req, res) => {
    await subirBase(req, res); // Asegura que subirBase maneje la solicitud
});

// Inicia el servidor en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT} - http://localhost:${PORT}`);
});
