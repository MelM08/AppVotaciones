const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

router.put('/editar-candidato', async (req, res) => {
  const { candidato } = req.body;

  try {
    const query = `UPDATE candidatos 
                   SET nombre = $1, descripcion = $2, numero = $3, estado = $4 
                   WHERE id = $5`;
    const values = [candidato.nombre, candidato.descripcion, candidato.numero, candidato.estado, candidato.id];
    await pool.query(query, values);

    res.status(200).json({ message: 'Candidato actualizado' });
  } catch (error) {
    console.error('Error al editar el candidato:', error);
    res.status(500).json({ message: 'Error al editar el candidato.' });
  }
});

module.exports = router;
