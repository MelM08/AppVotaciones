const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.use(fileUpload());

router.put('/editar-profesor', async (req, res) => {
    const { profesor } = req.body;
    console.log("Profesor recibido:", profesor);
  
    if (!profesor) {
      return res.status(400).json({ error: 'No se ha inicializado el profesor correctamente.' });
    }
  
    try {
      await pool.query(
        `UPDATE docentes SET documento_docente = $1, nombre_docente = $2 WHERE id = $3`,
        [profesor.documento_docente, profesor.nombre_docente, profesor.id]
      );
  
      res.json({ message: 'Profesor actualizado' });
    } catch (error) {
      console.error('Error al editar profesor:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

module.exports = router;