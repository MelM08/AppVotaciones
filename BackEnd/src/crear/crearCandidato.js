const express = require('express');
const router = express.Router();
const multer = require('multer'); // Middleware para manejar archivos
const { v4: uuidv4 } = require('uuid'); // Para generar nombres de archivo únicos
const { Pool } = require('pg');
const config = require('../../configDB');

const pool = new Pool(config);

// Configurar Multer para guardar la foto en el servidor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directorio donde se guardarán las fotos
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split('.').pop(); // Obtener la extensión del archivo
    const filename = uuidv4() + '.' + extension; // Generar un nombre único para el archivo
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

router.post('/crear-candidato', upload.single('foto'), async (req, res) => {
  const { estamentoId, nombre, descripcion, numeroCandidato, estado } = req.body;

  // Verificar si se ha subido una foto
  if (!req.file) {
      return res.status(400).json({ message: 'Por favor, seleccione una foto.' });
  }

  const foto = req.file.filename;

  try {
      const query = `INSERT INTO candidatos (id_estamento, nombre, descripcion, numero, id_foto, estado)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
      const values = [estamentoId, nombre, descripcion, numeroCandidato, foto, estado];
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
  } catch (error) {
      console.error('Error al crear el candidato:', error);
      res.status(500).json({ message: 'Error al crear el candidato.' });
  }
});

module.exports = router;
