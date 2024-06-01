const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();

const config = {
  user: 'postgres',
  host: 'localhost',
  password: '1234',
  database: 'usuarios_'
};

const pool = new Pool(config);

router.use(fileUpload());

router.post('/subir-excel-padres', async (req, res) => {
    try {
      // Verificar si se seleccionó un archivo 
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No se ha seleccionado ningún archivo.' });
      }
  
      const excelFile = req.files.excelFile;
  
      const workbook = XLSX.read(excelFile.data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
      // Verificar si el archivo tiene al menos una fila de datos
      if (excelData.length < 3) {
        return res.status(401).json({ message: 'El archivo Excel no tiene suficientes datos para procesar.' });
      }
  
      // Procesar los datos del archivo Excel
      for (let i = 2; i < excelData.length; i++) {
        let [sede, jornada, gradoEstudiante, grupo, nombreCompleto, FechaDeNacimiento, edad, documentoEstudiante,
          telefonoCelularEstudiante, telefonoFijoEstudiante, nombreMadre, documentoMadre, telefonoCelularMadre,
          nombrePadre, documentoPadre, telefonoCelularPadre, nombreAcudiente, documentoAcudiente, telefonoCelularAcudiente
        ] = excelData[i];
  
        // Verificar si documentoEstudiante no es una cadena y convertirlo a cadena si es necesario
        if (typeof documentoEstudiante !== 'string') {
          documentoEstudiante = String(documentoEstudiante);
        }
  
        // Verificar si alguno de los padres tiene todos los campos vacíos
        if ((!documentoPadre || !nombrePadre ) && (!documentoMadre || !nombreMadre)) {
          console.log(`La fila ${i + 1} no contiene suficientes datos para padres. Se ignorará.`);
          continue; // Saltar al siguiente ciclo sin insertar datos en la base de datos
        }
  
        // Verificar si el estudiante está presente en la base de datos
        const existingStudentQuery = 'SELECT id FROM estudiantes WHERE documento_estudiante = $1';
        const existingStudent = await pool.query(existingStudentQuery, [documentoEstudiante]);
  
        if (existingStudent.rows.length === 0) {
          console.log(`La fila ${i + 1} contiene datos de un estudiante que no está en la base de datos. Se omitirá.`);
          continue; // Saltar al siguiente ciclo
        }

        const estudianteId = existingStudent.rows[0].id;
  
        // Si el estudiante está presente, insertar los datos de los padres en la base de datos
        console.log(`La fila ${i + 1} contiene datos válidos. Se insertarán los datos de los padres.`);
        
        // Insertar los datos del padre en la base de datos si los datos de documentoPadre y nombrePadre son válidos
        if (documentoPadre && nombrePadre) {
          await pool.query('INSERT INTO padres (hijo_id, documento_padre, nombre_padre) VALUES ($1, $2, $3)', [estudianteId, documentoPadre, nombrePadre]);
          console.log(`Se agregó el padre de ${nombreCompleto}.`);
        }

        // Insertar los datos de la madre en la base de datos si los datos de documentoMadre y nombreMadre son válidos
        if (documentoMadre && nombreMadre) {
          await pool.query('INSERT INTO padres (hijo_id, documento_padre, nombre_padre) VALUES ($1, $2, $3)', [estudianteId, documentoMadre, nombreMadre]);
          console.log(`Se agregó la madre de ${nombreCompleto}.`);
        }
      }
  
      res.status(200).json({ message: 'Los datos de los padres del archivo Excel han sido procesados y guardados en la base de datos.' });
    } catch (error) {
      console.error('Error al procesar el archivo Excel:', error);
      res.status(500).json({ message: 'Error al procesar el archivo Excel.' });
    }
  });

module.exports = router;