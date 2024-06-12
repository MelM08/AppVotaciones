const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.use(fileUpload());

// Middleware para verificar el rol del usuario
const verificarRol = async (req, res, next) => {
    try {
        const { id } = req.params;
        let rol = '';
        let userDetails = {};

        // Buscar en las tablas de usuarios
        const estudianteResult = await pool.query('SELECT documento_estudiante, nombre_estudiante, grado_estudiante, institucion_estudiante FROM estudiantes WHERE documento_estudiante = $1', [id]);
        const padreResult = await pool.query('SELECT documento_padre, nombre_padre FROM padres WHERE documento_padre = $1', [id]);
        const docenteResult = await pool.query('SELECT documento_docente, nombre_docente FROM docentes WHERE documento_docente = $1', [id]);

        // Verificar en qué tabla se encuentra el usuario y asignar el rol y detalles correspondientes
        if (estudianteResult.rows.length > 0) {
            rol = 'estudiante';
            userDetails = {
                rol: 'estudiante',
                documento: estudianteResult.rows[0].documento_estudiante,
                nombre: estudianteResult.rows[0].nombre_estudiante,
                grado: estudianteResult.rows[0].grado_estudiante,
                institucion: estudianteResult.rows[0].institucion_estudiante
            };
        } else if (padreResult.rows.length > 0) {
            rol = 'padre';
            userDetails = {
                rol: 'padre',
                documento: padreResult.rows[0].documento_padre,
                nombre: padreResult.rows[0].nombre_padre
            };
        } else if (docenteResult.rows.length > 0) {
            rol = 'docente';
            userDetails = {
                rol: 'docente',
                documento: docenteResult.rows[0].documento_docente,
                nombre: docenteResult.rows[0].nombre_docente
            };
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        req.userRole = rol;
        req.userDetails = userDetails;
        //console.log({ id, rol, userDetails });

        next();

    } catch (e) {
        console.error('Error al verificar el rol del usuario:', e);
        res.status(500).json({ error: 'Error al verificar el rol del usuario' });
    }
}

// Ruta para verificar el rol y devolver los detalles del usuario
router.get('/usuario/:id', verificarRol, (req, res) => {
    res.json({
        userRole: req.userRole,
        userDetails: req.userDetails
    });
});

// Middleware para verificar el rol del administrador
const verificarRolAdmin = async (req, res, next) => {
    try {
        const { id, password } = req.body; // Recibimos también la contraseña desde el frontend
        const adminResult = await pool.query('SELECT id_administrador FROM administrador WHERE id_administrador = $1 AND contraseña = $2', [id, password]);

        if (adminResult.rows.length > 0) {
            req.userRole = 'admin';
            console.log({ id, rol: 'admin' });
            next();
        } else {
            res.status(404).json({ error: 'Credenciales de administrador incorrectas' });
        }

    } catch (e) {
        console.error('Error al verificar el rol del administrador:', e);
        res.status(500).json({ error: 'Error al verificar el rol del administrador' });
    }
}

// Ruta para verificar si el usuario es un administrador
router.post('/admin', verificarRolAdmin, (req, res) => {
    res.json({ userRole: req.userRole });
});

module.exports = router;