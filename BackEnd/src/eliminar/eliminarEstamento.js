const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

router.delete('/eliminar-estamento/:id', async (req, res) => {
    const estamentoId = req.params.id;

    try {
        await pool.query('BEGIN');

        // Eliminar candidatos asociados al estamento
        await pool.query('DELETE FROM candidatos WHERE id_estamento = $1', [estamentoId]);

        // Eliminar el estamento
        await pool.query('DELETE FROM estamentos WHERE id = $1', [estamentoId]);

        await pool.query('COMMIT');
        res.json({ message: 'Estamento y sus dependencias eliminados' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al eliminar el estamento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
