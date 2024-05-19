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

router.delete('/eliminar-estudiante/:documento', async (req, res) => {
    const documento = req.params.documento;
  
    try {
      // Eliminar padres relacionados con el estudiante
      await pool.query('DELETE FROM padres WHERE hijo_id = $1', [documento]);
  
      // Eliminar el estudiante
      await pool.query('DELETE FROM estudiantes WHERE documento_estudiante = $1', [documento]);
  
      res.json({ message: 'Estudiante y padres relacionados eliminados' });
    } catch (error) {
      console.error('Error al eliminar estudiante y padres relacionados:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

module.exports = router;