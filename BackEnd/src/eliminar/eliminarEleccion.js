const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

router.delete('/eliminar-eleccion/:id', async (req, res) => {
    const eleccionId = req.params.id;

    try {
        await pool.query('BEGIN');

        // Eliminar candidatos asociados a la elección
        await pool.query('DELETE FROM candidatos WHERE id_estamento IN (SELECT id FROM estamentos WHERE id_eleccion = $1)', [eleccionId]);

        // Eliminar estamentos asociados a la elección
        await pool.query('DELETE FROM estamentos WHERE id_eleccion = $1', [eleccionId]);

        // Eliminar la elección
        await pool.query('DELETE FROM elecciones WHERE id = $1', [eleccionId]);

        await pool.query('COMMIT');
        res.json({ message: 'Elección y sus dependencias eliminadas' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al eliminar la elección:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
