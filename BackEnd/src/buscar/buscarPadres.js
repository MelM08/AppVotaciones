const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();

const config = {
  user: 'postgres',
  host: 'localhost',
  password: 'root',
  database: 'usuarios'
};

const pool = new Pool(config);

router.use(fileUpload());

//Función genérica para validar todas las combinaciones de nombres posibles
function generarCombinaciones(palabras) {
    const combinaciones = [];
  
    for (let i = 0; i < palabras.length; i++) {
      for (let j = i + 1; j <= palabras.length; j++) {
        const nombre = palabras.slice(0, j).join(' ');
        const apellido = palabras.slice(j).join(' ');
        
        if (nombre && apellido) {
          combinaciones.push({ nombre, apellido });
        }
      }
    }
    return combinaciones;
}

router.post('/buscar-padres', async (req, res) => {
    const { termino } = req.body;
  
    try {
      let query = 'SELECT * FROM padres WHERE';
  
      //validamos primero si el termino contiene un '-', entonces es un grado, si es un número y empieza con N, es un documento, 
      //si es un número, es un documento, si no, es un nombre o apellido
      if (termino) {
        if (termino.includes('-')) {
          query += ` documento_padre ILIKE '${termino}%'`;
        } else if ((termino.startsWith('N') || termino.startsWith('n')) && !isNaN(Number(termino.substr(1)))) {
          query += ` documento_padre ILIKE '%${termino}%'`;
        } else if (!isNaN(Number(termino))) {
          query += ` documento_padre ILIKE '%${termino}%'`;
        } else {
          const palabras = termino.split(' ');
  
          if (palabras.length === 1) {
            query += ` (nombre_padre ILIKE '%${palabras[0]}%' OR apellido_padre ILIKE '%${palabras[0]}%')`;
          } else {
            const combinaciones = generarCombinaciones(palabras);
            query += ` (${combinaciones.map(({ nombre, apellido }) => `(nombre_padre ILIKE '%${nombre}%' AND apellido_padre ILIKE '%${apellido}%') OR (nombre_padre ILIKE '%${apellido}%' AND apellido_padre ILIKE '%${nombre}%')`).join(' OR ')})`;
          }
        }
      } else {
        return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda' });
      }
  
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error al buscar padres:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

module.exports = router;