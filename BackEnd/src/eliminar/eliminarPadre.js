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

router.delete('/eliminar-padre/:documento', async (req, res) => {
    const documento = req.params.documento;
  
    try {
      await pool.query('DELETE FROM padres WHERE documento_padre = $1', [documento]);
      res.json({ message: 'Padre eliminado' });
    } catch (error) {
      console.error('Error al eliminar Padre:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

module.exports = router;