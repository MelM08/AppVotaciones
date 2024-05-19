const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();

const config = {
  user: 'postgres',
  host: 'localhost',
  password: 'root',
  database: 'usuarios'
};

const pool = new Pool(config);

router.use(fileUpload());

router.post('/crear-eleccion', async (req, res) => {
    // Obtener los datos del cuerpo de la solicitud
    const { nombre, ano, estado } = req.body;
  
    // Verificar si algún campo está vacío
    if (!nombre || !ano || !estado) {
      return res.status(400).json({ error: 'Por favor, complete todos los campos.' });
    }
  
    try {
      // Query para insertar la nueva elección en la tabla 'elecciones'
      const query = 'INSERT INTO elecciones (nombre, ano, estado) VALUES ($1, $2, $3)';
      const values = [nombre, ano, estado];
  
      // Ejecutar la consulta SQL
      await pool.query(query, values);
  
      // Responder con un mensaje de éxito
      res.status(200).json({ message: 'Elección creada con éxito' });
    } catch (error) {
      // Si hay algún error al guardar en la base de datos, responder con un error 500
      console.error(error);
      res.status(500).json({ error: 'Error al crear la elección en la base de datos.' });
    }
  });

module.exports = router;