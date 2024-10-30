const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// URI de conexión a MongoDB
const uri = "mongodb+srv://crisvarela98:8RhsLRfAy0UHpMlW@adminsgppanel.fwdca.mongodb.net/adminSGPpanel";

// Definir el esquema flexible fuera de las funciones
const schema = new mongoose.Schema({}, { strict: false });
const Pedidos = mongoose.models.pedidos || mongoose.model('pedidos', schema, 'pedidos');
const Notas = mongoose.models.notas || mongoose.model('notas', schema, 'notas');

// Función para subir la base de datos
exports.uploadDatabase = async (req, res) => {
    try {
        await mongoose.connect(uri);
        console.log('Conectado a MongoDB Atlas');

        // Leer y subir datos a la colección 'pedidos'
        const pedidosData = JSON.parse(fs.readFileSync('data/pedidos.json', 'utf-8'));
        try {
            await Pedidos.insertMany(pedidosData);
        } catch (insertError) {
            console.error('Error al insertar pedidos:', insertError);
        }     
        

        // Leer y subir datos a la colección 'notas'
        const notasData = JSON.parse(fs.readFileSync('data/notas.json', 'utf-8'));
        await Notas.insertMany(notasData);

        res.json({ message: 'Base de datos subida exitosamente' });
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        res.status(500).json({ message: 'Error al subir la base de datos' });
    } finally {
        mongoose.connection.close();
    }
};

// Función para descargar la base de datos
exports.downloadDatabase = async (req, res) => {
    try {
        await mongoose.connect(uri);
        console.log('Conectado a MongoDB Atlas');

        // Asegurarse de que existe la carpeta json
        const jsonDir = path.join(__dirname, '..', 'json');
        if (!fs.existsSync(jsonDir)) {
            fs.mkdirSync(jsonDir);
        }

        // Función para obtener datos y guardar en JSON
        const fetchDataAndSave = async (modelName, fileName) => {
            const Model = mongoose.models[modelName] || mongoose.model(modelName, schema, modelName);
            const data = await Model.find().lean();

            const filePath = path.join(jsonDir, `${fileName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`Archivo ${fileName}.json guardado en ${filePath}`);
        };

        // Obtener y guardar datos de cada colección
        await fetchDataAndSave('clientes', 'clientes');
        await fetchDataAndSave('pedidos', 'pedidos');
        await fetchDataAndSave('usuarios', 'usuarios');
        await fetchDataAndSave('productos', 'productos');
        await fetchDataAndSave('notas', 'notas');

        res.json({ message: 'Base de datos descargada y guardada exitosamente' });
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        res.status(500).json({ message: 'Error al descargar la base de datos', error: error.message });
    } finally {
        mongoose.connection.close();
    }
};
