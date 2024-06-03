const { Pool } = require('pg');
const express = require('express');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.put('/editar-estamento', async (req, res) => {
  const { estamento } = req.body;
  
  if (!estamento || !estamento.id) {
    return res.status(400).json({ error: 'No se han proporcionado los datos del estamento o su ID.' });
  }
  
  try {
    // Verificar si el estamento existe
    const estamentoExistente = await pool.query('SELECT * FROM estamentos WHERE id = $1', [estamento.id]);

    if (estamentoExistente.rows.length === 0) {
      return res.status(404).json({ error: 'Estamento no encontrado' });
    }

    // Actualizar datos del estamento
    await pool.query(`
      UPDATE estamentos 
      SET nombre = $1, grados_habilitados = $2, rol_habilitado_para_votar = $3, estado = $4 
      WHERE id = $5`,
      [estamento.nombre, estamento.grados_habilitados, estamento.rol_habilitado_para_votar, estamento.estado, estamento.id]
    );

    res.json({ message: 'Estamento actualizado' });
  } catch (error) {
    console.error('Error al editar estamento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
