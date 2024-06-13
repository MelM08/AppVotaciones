const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

router.get('/activas', async (req, res) => {
    try {
        const query = `
            SELECT *
            FROM elecciones
            WHERE estado = 'ACTIVO';
        `;
        const result = await pool.query(query);

        // Filtrar solo las elecciones activas
        const eleccionesActivas = result.rows.filter(eleccion => eleccion.estado === 'ACTIVO');

        if (eleccionesActivas.length === 0) {
            res.status(404).json({ message: 'No se encontraron elecciones activas.' });
        } else {
            res.status(200).json(eleccionesActivas);
        }
    } catch (error) {
        console.error('Error al obtener elecciones activas:', error);
        res.status(500).json({ message: 'Error al obtener elecciones activas.' });
    }
});

module.exports = router;
