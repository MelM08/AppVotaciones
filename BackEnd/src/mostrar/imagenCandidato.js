const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Define la ruta de la carpeta donde se almacenan las imágenes de los candidatos
const UPLOADS_FOLDER = path.join(__dirname, '..', '..', 'uploads');

router.get('/imagen-candidato/:filename', (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(UPLOADS_FOLDER, filename);

    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ message: 'Imagen no encontrada' });
        }

        res.sendFile(imagePath);
    });
});

module.exports = router;