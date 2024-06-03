const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.use(fileUpload());

router.post('/buscar-padres', async (req, res) => {
    const { termino } = req.body;

    try {
        let query = `
            SELECT padres.*, estudiantes.documento_estudiante 
            FROM padres 
            JOIN estudiantes ON padres.hijo_id = estudiantes.id 
            WHERE
        `;
  
      //validamos primero si el termino contiene un '-', entonces es un grado, si es un número y empieza con N, es un documento, 
      //si es un número, es un documento, si no, es un nombre o apellido
      if (termino) {
        if ((termino.startsWith('N') || termino.startsWith('n')) && !isNaN(Number(termino.substr(1)))) {
            query += ` padres.documento_padre ILIKE '%${termino}%'`;
        } else if (!isNaN(Number(termino))) {
            query += ` padres.documento_padre ILIKE '%${termino}%'`;
        } else {
            const palabras = termino.split(' ');
            if (palabras.length === 1) {
                query += ` padres.nombre_padre ILIKE '%${palabras[0]}%'`;
            } else {
                query += ` (${palabras.map(palabra => `padres.nombre_padre ILIKE '%${palabra}%'`).join(' AND ')})`;
            }
        }
    } else {
        return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda' });
    }
    query += ' LIMIT 50';
    const result = await pool.query(query);
    res.json(result.rows);
} catch (error) {
    console.error('Error al buscar padres:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
}
});

module.exports = router;