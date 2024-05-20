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

router.put('/editar-padre', async (req, res) => {
    const { padre } = req.body;
    console.log("Padre recibido:", padre);
  
    if (!padre) {
      return res.status(400).json({ error: 'No se ha inicializado el padre correctamente.' });
    }
  
    try {
      await pool.query(
        `UPDATE padres SET documento_padre = $1, nombre_padre = $2 WHERE id = $3`,
        [padre.documento_padre, padre.nombre_padre, padre.id]
      );
  
      res.json({ message: 'Padre actualizado' });
    } catch (error) {
      console.error('Error al editar padre:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

module.exports = router;