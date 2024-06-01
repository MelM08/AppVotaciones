const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();

const config = {
  user: 'postgres',
  host: 'localhost',
  password: '1234',
  database: 'usuarios_'
};

const pool = new Pool(config);

router.use(fileUpload());

router.get('/listar-estudiantes', async (req, res) => {
    try {
      // Realiza la consulta SQL para obtener las elecciones
      const query = 'SELECT * FROM estudiantes';
      const result = await pool.query(query);
  
      // Envía los resultados como respuesta
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
      res.status(500).json({ message: 'Error al obtener los estudiantes.' });
    }
  });

module.exports = router;