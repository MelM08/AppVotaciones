const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.use(fileUpload());

router.get('/listar-docentes', async (req, res) => {
    try {
      // Realiza la consulta SQL para obtener las elecciones
      const query = 'SELECT * FROM docentes';
      const result = await pool.query(query);
  
      // Envía los resultados como respuesta
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error al obtener los docentes:', error);
      res.status(500).json({ message: 'Error al obtener los docentes.' });
    }
  });

module.exports = router;