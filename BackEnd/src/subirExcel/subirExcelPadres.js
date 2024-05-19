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

router.post('/subir-excel-padres', async (req, res) => {
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
        return res.status(401).json({ message: 'El archivo Excel no tiene datos para procesar.' });
      }
  
      // Verificar la estructura del archivo
      const [documento, nombre, apellido, grado, sede, documentoPadre, nombrePadre, apellidoPadre, documentoMadre, nombreMadre, apellidoMadre] = excelData[0];
      if (documento !== 'Documento' || nombre !== 'Nombre' || apellido !== 'Apellido' || grado !== 'Grado' || sede !== 'Sede' || documentoPadre !== 'Documento Padre' || nombrePadre !== 'Nombre Padre' || apellidoPadre !== 'Apellido Padre' || documentoMadre !== 'Documento Madre' || nombreMadre !== 'Nombre Madre' || apellidoMadre !== 'Apellido Madre') {
        return res.status(402).json({ message: 'La estructura del archivo Excel no es válida.' });
      }
  
      // Procesar los datos del archivo Excel
      for (let i = 1; i < excelData.length; i++) {
        let [documentoEstudiante, nombreEstudiante, apellidoEstudiante, gradoEstudiante, sedeEstudiante, documentoPadre, nombrePadre, apellidoPadre, documentoMadre, nombreMadre, apellidoMadre] = excelData[i];
  
        // Verificar si documentoEstudiante no es una cadena y convertirlo a cadena si es necesario
        if (typeof documentoEstudiante !== 'string') {
          documentoEstudiante = String(documentoEstudiante);
        }
  
        // Verificar si alguno de los padres tiene todos los campos vacíos
        if ((!documentoPadre || !nombrePadre || !apellidoPadre) && (!documentoMadre || !nombreMadre || !apellidoMadre)) {
          console.log(`La fila ${i + 1} no contiene suficientes datos para padres. Se ignorará.`);
          continue; // Saltar al siguiente ciclo sin insertar datos en la base de datos
        }
  
        // Verificar si el hijo está presente en la base de datos
        const existingStudentQuery = 'SELECT documento_estudiante FROM estudiantes WHERE documento_estudiante = $1';
        const existingStudent = await pool.query(existingStudentQuery, [documentoEstudiante]);
  
        if (existingStudent.rows.length === 0) {
          console.log(`La fila ${i + 1} contiene datos de un estudiante que no está en la base de datos. Se omitirá.`);
          continue; // Saltar al siguiente ciclo
        }
  
        // Verificar si los padres ya existen en la base de datos
        const existingPadreQuery = 'SELECT documento_padre FROM padres WHERE documento_padre = $1';
        const existingPadre = await pool.query(existingPadreQuery, [documentoPadre]);
        const existingMadreQuery = 'SELECT documento_padre FROM padres WHERE documento_padre = $1';
        const existingMadre = await pool.query(existingMadreQuery, [documentoMadre]);
  
        if (existingPadre.rows.length > 0 || existingMadre.rows.length > 0) {
          console.log(`La fila ${i + 1} contiene datos de padres que ya existen en la base de datos. Se omitirá.`);
          continue; // Saltar al siguiente ciclo
        }
  
        // Si ambos padres tienen todos los campos completos y no existen en la base de datos, insertar ambos en la base de datos
        console.log(`La fila ${i + 1} contiene datos de ambos padres. Se insertarán los datos de ambos padres.`);
        // Insertar los datos del padre en la base de datos si los datos de documentoPadre y nombrePadre y apellidoPadre son válidos
        if (documentoPadre && nombrePadre && apellidoPadre) {
          await pool.query('INSERT INTO padres (hijo_id, documento_padre, nombre_padre, apellido_padre) VALUES ($1, $2, $3, $4)', [documentoEstudiante, documentoPadre, nombrePadre, apellidoPadre]);
          console.log(`La fila ${i + 1} Sólo contiene datos del padre, se agregará solo el padre.`);
        }
        // Insertar los datos de la madre en la base de datos si los datos de documentoMadre y nombreMadre y apellidoMadre son válidos
        if (documentoMadre && nombreMadre && apellidoMadre) {
          await pool.query('INSERT INTO padres (hijo_id, documento_padre, nombre_padre, apellido_padre) VALUES ($1, $2, $3, $4)', [documentoEstudiante, documentoMadre, nombreMadre, apellidoMadre]);
          console.log(`La fila ${i + 1} Sólo contiene datos de la madre, se agregará solo la madre.`);
        }
      }
  
      res.status(200).json({ message: 'Los datos de los padres del archivo Excel han sido procesados y guardados en la base de datos.' });
    } catch (error) {
      console.error('Error al procesar el archivo Excel:', error);
      res.status(500).json({ message: 'Error al procesar el archivo Excel.' });
    }
  });

module.exports = router;