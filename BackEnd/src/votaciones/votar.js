const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

router.post('/votar', async (req, res) => {
    try {
        const { id_votante, id_sede, id_eleccion, id_estamento, id_candidato } = req.body;

        // Realizar la inserción del voto en la tabla de votos
        const query = `
            INSERT INTO votos (id_votante, id_sede, id_eleccion, id_estamento, id_candidato)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [id_votante, id_sede, id_eleccion, id_estamento, id_candidato];
        const result = await pool.query(query, values);

        // Enviar respuesta de éxito
        res.status(200).json({ message: 'Voto registrado exitosamente.' });
    } catch (error) {
        console.error('Error al registrar el voto:', error);
        res.status(500).json({ message: 'Error al registrar el voto.' });
    }
});


module.exports = router;