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

router.put('/editar-estudiante', async (req, res) => {
    const { estudiante } = req.body;
    
    if (!estudiante) {
      return res.status(400).json({ error: 'No se ha inicializado el estudiante correctamente.' });
    }
    
    try {
      //actualizar datos
      await pool.query(`UPDATE estudiantes SET nombre_estudiante = $1, apellido_estudiante = $2, grado_estudiante = $3, institucion_estudiante = $4 WHERE documento_estudiante = $5`,
        [estudiante.nombre_estudiante, estudiante.apellido_estudiante, estudiante.grado_estudiante, estudiante.institucion_estudiante, estudiante.documento_estudiante]);
    
        res.json({ message: 'Estudiante actualizado' });
      } catch (error) {
        console.error('Error al editar estudiante:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    });

module.exports = router;