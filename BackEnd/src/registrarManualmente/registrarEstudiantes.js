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

router.post('/registrar-estudiante', async (req, res) => {
    try {
      const { documento, nombre, grado, sede } = req.body;
  
      // Verificar si algún campo está vacío
      if (!documento || !nombre || !grado || !sede) {
          return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
      }
  
      // Verificar si el estudiante ya existe en la base de datos
      const existingStudentQuery = 'SELECT documento_estudiante FROM estudiantes WHERE documento_estudiante = $1';
      const existingStudent = await pool.query(existingStudentQuery, [documento]);
      if (existingStudent.rows.length > 0) {
          return res.status(401).json({ message: 'El estudiante ya existe en la base de datos.' });
      }
  
      // Insertar los datos del estudiante en la base de datos
      const insertQuery = 'INSERT INTO estudiantes (documento_estudiante, nombre_estudiante, grado_estudiante, institucion_estudiante) VALUES ($1, $2, $3, $4)';
      const insertValues = [documento, nombre, grado, sede];
      await pool.query(insertQuery, insertValues);
  
      res.status(200).json({ message: 'Estudiante guardado correctamente en la base de datos.' });
    } catch (error) {
      console.error('Error al guardar el estudiante:', error);
      res.status(500).json({ message: 'Error al guardar el estudiante en la base de datos.' });
    }
  });

module.exports = router;