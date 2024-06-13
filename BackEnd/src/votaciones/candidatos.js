const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

router.get('/estamentos/:id/candidatos', async (req, res) => {
    const { id } = req.params;
    console.log('ID del estamento:', id); // Verifica que el ID del estamento se esté recibiendo correctamente

    try {
        const query = `
            SELECT *
            FROM candidatos
            WHERE id_estamento = $1;
        `;
        const result = await pool.query(query, [id]);
        console.log('Resultado de la consulta:', result.rows); // Verifica los resultados de la consulta

        const candidatosActivos = result.rows.filter(candidato => candidato.estado === 'ACTIVO');
        res.status(200).json(candidatosActivos);
    } catch (error) {
        console.error('Error al obtener candidatos por estamento:', error);
        res.status(500).json({ message: 'Error al obtener candidatos por estamento.' });
    }
});

module.exports = router;