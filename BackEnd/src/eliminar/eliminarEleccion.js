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

router.delete('/eliminar-eleccion/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      // Eliminar la elección
      await pool.query('DELETE FROM elecciones WHERE id = $1', [id]);
  
      res.json({ message: 'Eleccion eliminada' });
    } catch (error) {
      console.error('Error al eliminar elección:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

module.exports = router;