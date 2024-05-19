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

router.post('/subir-excel-profesores', async (req, res) => {
    try {
      //verificamos si se seleccionó un archivo 
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No se ha seleccionado ningún archivo.' });
      }
    
      const excelFile = req.files.excelFile;
    
      const workbook = XLSX.read(excelFile.data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
      // Verificar si el archivo tiene al menos una fila de datos
      if (excelData.length < 2) {
        return res.status(400).json({ message: 'El archivo Excel no tiene datos para procesar.' });
      }
    
      // Verificar la estructura del archivo
      const [documento, nombre, apellido, sede] = excelData[0];
      if (documento !== 'Documento' || nombre !== 'Nombre' || apellido !== 'Apellido' || sede !== 'Sede') {
        return res.status(401).json({ message: 'La estructura del archivo Excel no es válida.' });
      }
    
      // Obtener todos los profesores de la base de datos
      const dbProfesorQuery = 'SELECT documento_docente FROM docentes';
      const dbProfesor = await pool.query(dbProfesorQuery);
    
      // Lista para almacenar los documentos de los profesores del archivo Excel
      const excelDocuments = new Set();
    
      // Procesar los datos del archivo Excel a partir de la segunda fila
      for (let i = 1; i < excelData.length; i++) {
        let [documentoProfesor, nombreProfesor, apellidoProfesor, institucionProfesor] = excelData[i];
    
        // Verificar si documentoProfesor no es una cadena y convertirlo a cadena si es necesario
        if (typeof documentoProfesor !== 'string') {
            documentoProfesor = String(documentoProfesor);
        }
  
        // Verificar si algún campo está vacío
        if (!documentoProfesor || !nombreProfesor || !apellidoProfesor || !institucionProfesor) {
          console.log(`La fila ${i + 1} contiene un campo vacío. Se ignorará.`);
          continue; // Saltar al siguiente ciclo sin insertar datos en la base de datos
        }
    
        // Guardar el documento del profesor en la lista
        excelDocuments.add(documentoProfesor);
    
        // Verificar si el profesor ya existe en la base de datos
        const existingProfesorQuery = 'SELECT documento_docente FROM docentes WHERE documento_docente = $1';
        const existingProfesor = await pool.query(existingProfesorQuery, [documentoProfesor]);
    
        // Si el profesor ya existe, imprimir un mensaje y continuar con el siguiente ciclo
        if (existingProfesor.rows.length > 0) {
          console.log(`El profesor con documento ${documentoProfesor} ya existe en la base de datos. Se omitirá.`);
          continue;
        }
    
        // Insertar los datos en la base de datos
        const insertQuery = 'INSERT INTO docentes (documento_docente, nombre_docente, apellido_docente, institucion_docente) VALUES ($1, $2, $3, $4)';
        const insertValues = [documentoProfesor, nombreProfesor, apellidoProfesor, institucionProfesor];
        await pool.query(insertQuery, insertValues);
        console.log(`Profesor con documento ${documentoProfesor} agregado a la base de datos.`)
      }
    
      // Verificar si algún profesor de la base de datos no está en el archivo Excel y borrarlo
      for (const profesor of dbProfesor.rows) {
        if (!excelDocuments.has(profesor.documento_docente)) {
          console.log(`El profesor con documento ${profesor.documento_docente} ya no está en el archivo Excel. Se eliminará de la base de datos.`);
    
          // Eliminar al profesor de la tabla `docentes`
          await pool.query('DELETE FROM docentes WHERE documento_docente = $1', [profesor.documento_docente]);
        }
      }
    
      res.status(200).json({ message: 'Los datos del archivo Excel han sido procesados y guardados en la base de datos.' });
    } catch (error) {
      console.error('Error al procesar el archivo Excel:', error);
      res.status(500).json({ message: 'Error al procesar el archivo Excel.' });
    }
  });

module.exports = router;