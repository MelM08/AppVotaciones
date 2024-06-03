const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

router.delete('/eliminar-candidato/:id', async (req, res) => {
    const candidatoId = req.params.id;

    try {
        await pool.query('BEGIN');

        // Eliminar el candidato
        await pool.query('DELETE FROM candidatos WHERE id = $1', [candidatoId]);

        await pool.query('COMMIT');
        res.json({ message: 'Candidato eliminado' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al eliminar el candidato:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
