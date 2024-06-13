const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

router.get('/resultados-candidatos', async (req, res) => {
    try {
      // Consulta SQL para obtener los votos por candidato
      const query = `
        	SELECT 
          e.id AS eleccion_id,
          e.nombre AS eleccion_nombre,
          est.id AS estamento_id,
          est.nombre AS estamento_nombre,
          c.id AS candidato_id,
          c.nombre AS candidato_nombre,
          c.id_foto AS id_foto,
          COUNT(v.id) AS total_votos_candidato,
          SUM(COUNT(v.id)) OVER (PARTITION BY e.id, est.id) AS total_votos_estamento,
          SUM(CASE WHEN v.sede = 'José María Córdoba' THEN 1 ELSE 0 END) AS votos_jose_maria_cordoba,
          SUM(CASE WHEN v.sede = 'Manuela Beltrán' THEN 1 ELSE 0 END) AS votos_manuela_beltran,
          SUM(CASE WHEN v.sede = 'Pedro Antonio Sánchez Tello' THEN 1 ELSE 0 END) AS votos_pedro_antonio_sanchez_tello
          FROM 
              votos v
          JOIN 
              candidatos c ON v.id_candidato = c.id
          JOIN 
              estamentos est ON v.id_estamento = est.id
          JOIN
              elecciones e ON v.id_eleccion = e.id
          GROUP BY 
              e.id, e.nombre, est.id, est.nombre, c.id, c.nombre, c.id_foto
          ORDER BY 
              e.id, est.id, total_votos_candidato DESC;
        `;
      
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error('Error ejecutando la consulta', err);
      res.status(500).send('Error al obtener los resultados de los candidatos');
    }
  });

module.exports = router;