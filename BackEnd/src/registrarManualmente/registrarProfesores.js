const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.use(fileUpload());

router.post('/registrar-profesor', async (req, res) => {
    try {
      const { documento, nombre } = req.body;
  
      // Verificar si algún campo está vacío
      if (!documento || !nombre) {
          return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
      }
  
      // Verificar si el profesor ya existe en la base de datos
      const profesorExistenteQuery = 'SELECT documento_docente FROM docentes WHERE documento_docente = $1';
      const profesorExistente = await pool.query(profesorExistenteQuery, [documento]);
      if (profesorExistente.rows.length > 0) {
          return res.status(401).json({ message: 'El profesor ya existe en la base de datos.' });
      }
  
      // Insertar los datos del profesor en la base de datos
      const insertarQuery = 'INSERT INTO docentes (documento_docente, nombre_docente) VALUES ($1, $2)';
      const insertarValues = [documento, nombre];
      await pool.query(insertarQuery, insertarValues);
  
      res.status(200).json({ message: 'Profesor guardado correctamente en la base de datos.' });
    } catch (error) {
      console.error('Error al guardar el profesor:', error);
      res.status(500).json({ message: 'Error al guardar el profesor en la base de datos.' });
    }
  });

module.exports = router;