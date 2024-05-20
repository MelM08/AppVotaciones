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
      // Obtener el ID del estudiante basado en el documento
      const estudianteResult = await pool.query('SELECT id FROM estudiantes WHERE documento_estudiante = $1', [documento]);
      if (estudianteResult.rows.length === 0) {
        return res.status(404).json({ error: 'Estudiante no encontrado' });
      }
      const estudianteId = estudianteResult.rows[0].id;

      // Eliminar padres relacionados con el estudiante
      await pool.query('DELETE FROM padres WHERE hijo_id = $1', [estudianteId]);
  
      // Eliminar el estudiante
      await pool.query('DELETE FROM estudiantes WHERE documento_estudiante = $1', [documento]);
  
      res.json({ message: 'Estudiante y padres relacionados eliminados' });
    } catch (error) {
      console.error('Error al eliminar estudiante y padres relacionados:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

module.exports = router;