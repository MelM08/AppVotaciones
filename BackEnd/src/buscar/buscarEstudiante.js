const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.use(fileUpload());

router.post('/buscar-estudiantes', async (req, res) => {
    const { termino } = req.body;
  
    try {
      let query = 'SELECT * FROM estudiantes WHERE';
  
      //validamos primero si el termino contiene un '-', entonces es un grado, si es un número y empieza con N, es un documento, 
      //si es un número, es un documento, si no, es un nombre o apellido
      if (termino) {
        if ((termino.startsWith('N') || termino.startsWith('n')) && !isNaN(Number(termino.substr(1)))) {
          query += ` documento_estudiante ILIKE '%${termino}%'`;
        } else if (!isNaN(Number(termino))) {
          query += ` documento_estudiante ILIKE '%${termino}%'`;
        } else {
          const palabras = termino.split(' ');

          if (palabras.length === 1) {
            query += ` nombre_estudiante ILIKE '%${palabras[0]}%'`;
          } else {
            query += ` (${palabras.map(palabra => `nombre_estudiante ILIKE '%${palabra}%'`).join(' AND ')})`;
          }
        }
      } //else {
      //   return res.status(400).json({ alert: 'Debes proporcionar un término de búsqueda' });
      // }
      //Comentando y no eliminado por motivos de posible uso futuro

      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      // console.error('Error al buscar estudiantes:', error);
      // res.status(500).json({ error: 'Error interno del servidor' });
      //Comentando y no eliminado por motivos de posible uso futuro
    }
  });

module.exports = router;