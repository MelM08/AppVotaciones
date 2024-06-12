const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

// Mapeo de roles de entrada a los roles almacenados en la base de datos
const rolMapping = {
    'estudiante': 'Estudiantes',
    'docente': 'Docentes',
    'padre': 'Padres de Familia'
};

// Mapeo de grados del formato cadena a números
const gradoMapping = {
    'Transición': 0,
    'Primero': 1,
    'Segundo': 2,
    'Tercero': 3,
    'Cuarto': 4,
    'Quinto': 5,
    'Sexto': 6,
    'Septimo': 7,
    'Octavo': 8,
    'Noveno': 9,
    'Décimo': 10,
    'Once': 11
};

router.get('/elecciones/:id/estamentos', async (req, res) => {
    const { id } = req.params;
    const { rol, grado } = req.query || {};

    console.log('Datos del usuario estamento:', { rol, grado });

    try {
        const query = `
            SELECT *
            FROM estamentos
            WHERE id_eleccion = $1;
        `;
        const result = await pool.query(query, [id]);

        // Convertir el rol de entrada a la forma utilizada en la base de datos
        const rolDB = rolMapping[rol.toLowerCase()];

        // Verificar que `rolDB` se ha mapeado correctamente
        console.log('Rol mapeado en DB:', rolDB);

        // Convertir el grado numérico a su representación en la base de datos
        const gradoDB = Object.entries(gradoMapping).find(([key, value]) => value == grado)?.[0];

        // Verificar que `gradoDB` se ha mapeado correctamente
        console.log('Grado mapeado en DB:', gradoDB);

        const estamentosFiltrados = result.rows.filter(estamento => {
            console.log('Procesando estamento:', estamento);

            // Verificar condiciones de filtrado
            const rolCondition = estamento.rol_habilitado_para_votar === 'Todos' || estamento.rol_habilitado_para_votar === rolDB;
            const gradoCondition = estamento.grados_habilitados === 'Todos' ||
                                    estamento.grados_habilitados === 'Ninguno' && gradoDB === undefined ||
                                    estamento.grados_habilitados === gradoDB;

            console.log(`RolCondition (${estamento.rol_habilitado_para_votar} === ${rolDB}):`, rolCondition);
            console.log(`GradoCondition (${estamento.grados_habilitados} === ${gradoDB}):`, gradoCondition);

            return (
                estamento.estado === 'ACTIVO' &&
                rolCondition &&
                gradoCondition
            );
        });

        // Verificar si hay estamentos filtrados
        if (estamentosFiltrados.length > 0) {
            console.log('Estamentos filtrados:', estamentosFiltrados);
            res.status(200).json(estamentosFiltrados); // Enviar solo el array
        } else {
            res.status(404).json({ message: 'No se encontraron estamentos que cumplan con los criterios de filtrado.' });
        }
    } catch (error) {
        console.error('Error al obtener estamentos por elección:', error);
        res.status(500).json({ message: 'Error al obtener estamentos por elección.' });
    }
});

module.exports = router;
