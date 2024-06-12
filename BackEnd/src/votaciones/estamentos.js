const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

router.get('/elecciones/:id/estamentos', async (req, res) => {
    const { id } = req.params;
    const { rol, grado } = req.query || {}; // Obtén los datos del usuario de los parámetros de consulta
    try {
        console.log('Datos del usuario:', { rol, grado }); // Imprime los datos del usuario en la consola del servidor

        const query = `
            SELECT *
            FROM estamentos
            WHERE id_eleccion = $1;
        `;
        const result = await pool.query(query, [id]);

        // Filtrar estamentos según las validaciones
        const estamentosFiltrados = result.rows.filter(estamento => {
            return estamento.estado === 'ACTIVO' && estamento.rol_habilitado_para_votar === rol && estamento.grados_habilitados === grado;
        });

        // Verificar si hay estamentos filtrados
        if (estamentosFiltrados.length > 0) {
            res.status(200).json({ user: req.user, estamentos: estamentosFiltrados });
        } else {
            res.status(404).json({ message: 'No se encontraron estamentos que cumplan con los criterios de filtrado.' });
        }
    } catch (error) {
        console.error('Error al obtener estamentos por elección:', error);
        res.status(500).json({ message: 'Error al obtener estamentos por elección.' });
    }
});

module.exports = router;
