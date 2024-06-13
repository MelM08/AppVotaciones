const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

// Ruta para registrar un voto
router.post('/registrar', async (req, res) => {
    const { id_votante, sede, id_eleccion, id_estamento, id_candidato } = req.body;

    try {
        const query = `
            INSERT INTO votos (id_votante, sede, id_eleccion, id_estamento, id_candidato)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        const values = [id_votante, sede, id_eleccion, id_estamento, id_candidato];

        const result = await pool.query(query, values);
        const nuevoVotoId = result.rows[0].id;

        res.status(201).json({ message: 'Voto registrado exitosamente.', votoId: nuevoVotoId });
    } catch (error) {
        console.error('Error al registrar voto:', error);
        res.status(500).json({ message: 'Error al registrar voto.' });
    }
});

module.exports = router;