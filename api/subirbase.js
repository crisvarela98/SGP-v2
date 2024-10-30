const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const uri = "mongodb+srv://crisvarela98:8RhsLRfAy0UHpMlW@adminsgppanel.fwdca.mongodb.net/adminSGPpanel";

module.exports = async function subirBase(req, res) {
    try {
        await mongoose.connect(uri);
        console.log('Conectado a MongoDB Atlas para subir datos');

        const schema = new mongoose.Schema({}, { strict: false });
        const collections = [
            { name: 'pedidos', file: 'data/pedidos.json' },
            { name: 'notas', file: 'data/notas.json' }
        ];

        for (const { name, file } of collections) {
            const filePath = path.join(__dirname, '..', file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const Model = mongoose.model(name, schema, name);
            await Model.deleteMany(); // Limpia la colección antes de insertar
            await Model.insertMany(data);
            console.log(`Datos de ${name} subidos a MongoDB`);
        }

        await mongoose.connection.close();
        console.log('Conexión cerrada después de subir datos');
        res.json({ message: 'Base de datos actualizada con éxito desde la carpeta data.' });
    } catch (error) {
        console.error('Error al subir la base de datos:', error);
        res.status(500).json({ message: 'Error al subir la base de datos' });
    }
};
