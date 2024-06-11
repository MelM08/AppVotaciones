const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.use(fileUpload());

router.post('/buscar-profesores', async (req, res) => {
    const { termino } = req.body;
  
    try {
      let query = 'SELECT * FROM docentes WHERE';
      //Validamos primero si tiene una N en la identificación, luego valida si es un número y por último valida el termino en letras
      //esto para validar cada item de búsqueda.
      if (termino) {
        if ((termino.startsWith('N') || termino.startsWith('n')) && !isNaN(Number(termino.substr(1)))) {
          query += ` documento_docente ILIKE '%${termino}%'`;
        } else if (!isNaN(Number(termino))) {
          query += ` documento_docente ILIKE '%${termino}%'`;
        } else {
          const palabras = termino.split(' ');
          if (palabras.length === 1) {
            query += ` nombre_docente ILIKE '%${palabras[0]}%'`;
          } else {
            query += ` (${palabras.map(palabra => `nombre_docente ILIKE '%${palabra}%'`).join(' AND ')})`;
          }
        }
      } else {
         return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda' });
      }

      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error al buscar profesores:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });


module.exports = router;