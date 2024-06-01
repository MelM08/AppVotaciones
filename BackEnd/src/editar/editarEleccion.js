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

router.put('/editar-eleccion', async (req, res) => {
    const { eleccion } = req.body;
  
    if (!eleccion) {
      return res.status(400).json({ error: 'No se ha inicializado la elección correctamente.' });
    }
  
    try {
      // Actualizar datos
      await pool.query(`UPDATE elecciones SET nombre = $1, otra_propiedad = $2 WHERE id = $3`,
        [eleccion.nombre, eleccion.otra_propiedad, eleccion.id]);
  
      res.json({ message: 'Eleccion actualizada' });
    } catch (error) {
      console.error('Error al editar elección:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

module.exports = router;