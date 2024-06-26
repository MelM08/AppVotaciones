const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.use(fileUpload());

router.post('/registrar-padre', async (req, res) => {
    const { documentoEstudiante, documentoPadre, nombrePadre} = req.body;
  
    try {
      // Verificar si el estudiante existe en la base de datos
      const estudianteQuery = 'SELECT id FROM estudiantes WHERE documento_estudiante = $1';
      const estudianteResult = await pool.query(estudianteQuery, [documentoEstudiante]);
      if (estudianteResult.rows.length === 0) {
        return res.status(400).json({ message: 'El estudiante no existe en la base de datos.' });
      }
  
      const estudianteId = estudianteResult.rows[0].id;
  
      // Verificar si el padre ya está registrado
      const padreQuery = 'SELECT * FROM padres WHERE documento_padre = $1';
      const padreResult = await pool.query(padreQuery, [documentoPadre]);
      if (padreResult.rows.length > 0) {
        return res.status(401).json({ message: 'El padre ya está registrado en la base de datos.' });
      }
  
      // Insertar el padre en la base de datos
      const insertQuery = 'INSERT INTO padres (hijo_id, documento_padre, nombre_padre) VALUES ($1, $2, $3)';
      await pool.query(insertQuery, [estudianteId, documentoPadre, nombrePadre]);
  
      // Respuesta exitosa
      res.status(200).json({ message: 'Padre registrado exitosamente.' });
    } catch (error) {
      console.error('Error al registrar padre:', error);
      res.status(500).json({ message: 'Error al registrar padre.' });
    }
});

module.exports = router;