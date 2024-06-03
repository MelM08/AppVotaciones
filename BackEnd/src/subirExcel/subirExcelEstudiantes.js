const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.use(fileUpload());

router.post('/subir-excel-estudiantes', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No se ha seleccionado ningún archivo.' });
    }

    const excelFile = req.files.excelFile;
    const workbook = XLSX.read(excelFile.data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (excelData.length < 2) {
      return res.status(400).json({ message: 'El archivo Excel no tiene datos para procesar.' });
    }

    const [Sede, Jornada, Grado, Grupo, NombreCompleto, FechaDeNacimiento, Edad, Documento] = excelData[1];
    if (Sede !== 'Sede' || Jornada !== 'Jornada' || Grado !== 'Grado' || Grupo !== 'Grupo' || NombreCompleto !== 'Nombre Completo'
      || FechaDeNacimiento !== 'Fecha de Nacimiento' || Edad !== 'Edad' || Documento !== 'Número de Documento') {
      return res.status(401).json({ message: 'La estructura del archivo Excel no es válida.' });
    }


    const dbStudentsQuery = 'SELECT documento_estudiante, grado_estudiante FROM estudiantes';
    const dbStudents = await pool.query(dbStudentsQuery);

    const excelDocuments = new Set();

    for (let i = 2; i < excelData.length; i++) {
      let [sede, jornada, gradoEstudiante, grupo, nombreCompleto, FechaDeNacimiento, edad, documentoEstudiante] = excelData[i];

      if (typeof documentoEstudiante !== 'string') {
        documentoEstudiante = String(documentoEstudiante);
      }

      if (!documentoEstudiante || !nombreCompleto || !gradoEstudiante || !sede) {
        console.log(`La fila ${i + 1} contiene un campo vacío. Se ignorará.`);
        continue;
      }

      excelDocuments.add(documentoEstudiante);

      const existingStudentQuery = 'SELECT documento_estudiante FROM estudiantes WHERE documento_estudiante = $1';
      const existingStudent = await pool.query(existingStudentQuery, [documentoEstudiante]);

      if (existingStudent.rows.length > 0) {
        const dbStudent = dbStudents.rows.find(student => student.documento_estudiante === documentoEstudiante);
        if (dbStudent && dbStudent.grado_estudiante !== gradoEstudiante) {
          console.log(`El estudiante con documento ${documentoEstudiante} ha cambiado de grado (${dbStudent.grado_estudiante} -> ${gradoEstudiante}). Actualizando en la base de datos.`);
          const updateQuery = 'UPDATE estudiantes SET grado_estudiante = $1 WHERE documento_estudiante = $2';
          await pool.query(updateQuery, [gradoEstudiante, documentoEstudiante]);
        }
        console.log(`El estudiante con documento ${documentoEstudiante} ya existe en la base de datos. Se omitirá.`);
        continue;
      }

      const insertQuery = 'INSERT INTO estudiantes (documento_estudiante, nombre_estudiante, grado_estudiante, institucion_estudiante) VALUES ($1, $2, $3, $4)';
      const insertValues = [documentoEstudiante, nombreCompleto, gradoEstudiante, sede];
      await pool.query(insertQuery, insertValues);
      console.log(`Se añadió el estudiante ${documentoEstudiante} al archivo`);
    }

    for (const student of dbStudents.rows) {
      if (!excelDocuments.has(student.documento_estudiante)) {
        console.log(`El estudiante con documento ${student.documento_estudiante} ya no está en el archivo Excel. Se eliminará de la base de datos.`);

        await pool.query('DELETE FROM padres WHERE hijo_id = $1', [student.documento_estudiante]);
        await pool.query('DELETE FROM estudiantes WHERE documento_estudiante = $1', [student.documento_estudiante]);
      }
    }

    res.status(200).json({ message: 'Los datos del archivo Excel han sido procesados y guardados en la base de datos.' });
  } catch (error) {
    console.error('Error al procesar el archivo Excel:', error);
    res.status(500).json({ message: 'Error al procesar el archivo Excel.' });
  }
});

module.exports = router;