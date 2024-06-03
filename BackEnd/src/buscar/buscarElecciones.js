const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.use(fileUpload());

router.post('/buscar-eleccion', async (req, res) => {
    const { termino } = req.body;

    try {
        let query = `
            SELECT id, nombre, ano, estado
            FROM elecciones
            WHERE
        `;

        if (termino) {
            const palabras = termino.split(' ');
            query += ` (${palabras.map(palabra => `nombre ILIKE '%${palabra}%'`).join(' AND ')})`;
        } else {
            return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda' });
        }

        query += ` LIMIT ${req.query.limit || 50} OFFSET ${(req.query.page - 1) * (req.query.limit || 10)}`;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al buscar elecciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
