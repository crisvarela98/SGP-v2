const mongoose = require('mongoose');
const fs = require('fs');

// URI de conexión a MongoDB
const uri = "mongodb+srv://crisvarela98:8RhsLRfAy0UHpMlW@adminsgppanel.fwdca.mongodb.net/adminSGPpanel";

module.exports = async function descargarBase(req, res) {
    try {
        await mongoose.connect(uri);
        console.log('Conectado a MongoDB Atlas para descargar datos');

        const schema = new mongoose.Schema({}, { strict: false });
        const collections = [
            { name: 'clientes', file: 'json/clientes.json' },
            { name: 'pedidos', file: 'json/pedidos.json' },
            { name: 'usuarios', file: 'json/usuarios.json' },
            { name: 'productos', file: 'json/productos.json' },
            { name: 'notas', file: 'json/notas.json' }
        ];

        for (const { name, file } of collections) {
            const Model = mongoose.model(name, schema, name);
            const data = await Model.find().lean();
            fs.writeFileSync(file, JSON.stringify(data, null, 2));
            console.log(`Datos de ${name} guardados en ${file}`);
        }

        await mongoose.connection.close();
        console.log('Conexión cerrada después de descargar datos');
        res.json({ message: 'Base de datos descargada y guardada en JSON' });
    } catch (error) {
        console.error('Error al descargar la base de datos:', error);
        res.status(500).json({ message: 'Error al descargar la base de datos' });
    }
};
