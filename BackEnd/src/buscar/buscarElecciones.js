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

router.post('/buscar-eleccion', async (req, res) => {
    try {
      // Realiza la consulta SQL para obtener las elecciones
      const query = 'SELECT id, nombre FROM elecciones'; 
      const result = await pool.query(query);
  
      // Envía los resultados como respuesta
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error al obtener las elecciones:', error);
      res.status(500).json({ message: 'Error al obtener las elecciones.' });
    }
  });

module.exports = router;