const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

router.get('/listar-candidatos', async (req, res) => {
    const { estamentoId } = req.query;
    try {
        const query = 'SELECT * FROM candidatos WHERE id_estamento = $1';
        const result = await pool.query(query, [estamentoId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los estamentos:', error);
        res.status(500).json({ message: 'Error al obtener los estamentos.' });
    }
});

module.exports = router;
