const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

router.post('/crear-estamento', async (req, res) => {
    const { eleccionId, nombre, gradosHabilitados, rolHabilitadoParaVotar, estado } = req.body;

    if (!nombre || !nombre.trim()) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    try {
        const query = `INSERT INTO estamentos (id_eleccion, nombre, grados_habilitados, rol_habilitado_para_votar, estado)
                       VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const values = [eleccionId, nombre, gradosHabilitados, rolHabilitadoParaVotar, estado];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear el estamento:', error);
        res.status(500).json({ message: 'Error al crear el estamento.' });
    }
});

module.exports = router;
