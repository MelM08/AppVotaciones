const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.use(fileUpload());

router.put('/editar-eleccion', async (req, res) => {
  const { eleccion } = req.body;
  console.log("Eleccion recibida:", eleccion);
  
  if (!eleccion) {
    return res.status(400).json({ error: 'No se ha inicializado la elección correctamente.' });
  }
  
  try {
    // Actualizar datos de la elección
    await pool.query(`
      UPDATE elecciones 
      SET nombre = $1, ano = $2, estado = $3 
      WHERE id = $4`,
      [eleccion.nombre, eleccion.ano, eleccion.estado, eleccion.id]
    );

    res.json({ message: 'Elección actualizada' });
    console.log("Elección editada:", eleccion);
  } catch (error) {
    console.error('Error al editar elección:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;