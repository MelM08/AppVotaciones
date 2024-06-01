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

router.put('/editar-estudiante', async (req, res) => {
  const { estudiante } = req.body;
  console.log("Estudiante recibido:", estudiante);
  
  if (!estudiante) {
    return res.status(400).json({ error: 'No se ha inicializado el estudiante correctamente o no se proporcionó el ID o el documento del estudiante.' });
  }
  
  try {
    // Actualizar el documento del estudiante sin modificar el ID
    await pool.query(`
      UPDATE estudiantes 
      SET documento_estudiante = $1, nombre_estudiante = $2, grado_estudiante = $3, institucion_estudiante = $4 
      WHERE id = $5`,
      [estudiante.documento_estudiante, estudiante.nombre_estudiante, estudiante.grado_estudiante, estudiante.institucion_estudiante, estudiante.id]
    );

    res.json({ message: 'Estudiante actualizado' });
    console.log("Estudiante editado:", estudiante);
  } catch (error) {
    console.error('Error al editar estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;