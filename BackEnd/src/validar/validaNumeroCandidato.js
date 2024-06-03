const { Pool } = require('pg');
const express = require('express');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.get('/validar-numeroCandidato/:numeroCandidato/:estamentoId', async (req, res) => {
  const numeroCandidato = req.params.numeroCandidato;
  const estamentoId = req.params.estamentoId;
  
  try {
    // Verificar si el número de candidato existe en el estamento seleccionado
    const result = await pool.query('SELECT COUNT(*) FROM candidatos WHERE numero = $1 AND id_estamento = $2', [numeroCandidato, estamentoId]);
    const count = parseInt(result.rows[0].count);
    
    res.json({ exists: count > 0 });
  } catch (error) {
    console.error('Error al verificar el número de candidato:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
