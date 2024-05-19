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

router.delete('/eliminar-profesor/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      await pool.query('DELETE FROM docentes WHERE id = $1', [id]);
      res.json({ message: 'Profesor eliminado' });
    } catch (error) {
      console.error('Error al eliminar Profesor:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

module.exports = router;