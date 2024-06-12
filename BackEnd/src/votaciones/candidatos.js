const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

router.get('/estamentos/:id/candidatos', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT *
            FROM candidatos
            WHERE estamento_id = $1;
        `;
        const result = await pool.query(query, [id]);

        // Filtrar candidatos según el estado activo
        const candidatosActivos = result.rows.filter(candidato => candidato.estado === 'ACTIVO');

        res.status(200).json(candidatosActivos);
    } catch (error) {
        console.error('Error al obtener candidatos por estamento:', error);
        res.status(500).json({ message: 'Error al obtener candidatos por estamento.' });
    }
});

module.exports = router;