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

    // Asegurar que las cabeceras sean correctas
    const [Sede, Jornada, Grado, Grupo, NombreCompleto, FechaDeNacimiento, Edad, Documento] = excelData[1];
    if (Sede !== 'Sede' || Jornada !== 'Jornada' || Grado !== 'Grado' || Grupo !== 'Grupo' || NombreCompleto !== 'Nombre Completo'
      || FechaDeNacimiento !== 'Fecha de Nacimiento' || Edad !== 'Edad' || Documento !== 'Número de Documento') {
      return res.status(401).json({ message: 'La estructura del archivo Excel no es válida.' });
    }

    // Recuperar todos los estudiantes actuales de la base de datos
    const dbStudentsQuery = 'SELECT id, documento_estudiante, grado_estudiante FROM estudiantes';
    const dbStudents = await pool.query(dbStudentsQuery);

    // Mantener un conjunto de documentos desde el Excel para fácil búsqueda
    const excelDocuments = new Set();

    for (let i = 2; i < excelData.length; i++) {
      let [sede, jornada, gradoEstudiante, grupo, nombreCompleto, FechaDeNacimiento, edad, documentoEstudiante] = excelData[i];

      // Convertir el documento a cadena (esto maneja números y textos como "N22")
      documentoEstudiante = documentoEstudiante ? String(documentoEstudiante).trim() : '';

      // Validar que los campos requeridos no estén vacíos
      if (!documentoEstudiante || !nombreCompleto || !gradoEstudiante || !sede) {
        console.log(`La fila ${i + 1} contiene un campo vacío. Se ignorará.`);
        continue;
      }

      excelDocuments.add(documentoEstudiante);

      // Comprobar si el estudiante ya existe en la base de datos
      const existingStudentQuery = 'SELECT id, documento_estudiante FROM estudiantes WHERE documento_estudiante = $1';
      const existingStudent = await pool.query(existingStudentQuery, [documentoEstudiante]);

      if (existingStudent.rows.length > 0) {
        // Verificar si el grado del estudiante ha cambiado
        const dbStudent = dbStudents.rows.find(student => student.documento_estudiante === documentoEstudiante);
        if (dbStudent && dbStudent.grado_estudiante !== gradoEstudiante) {
          console.log(`El estudiante con documento ${documentoEstudiante} ha cambiado de grado (${dbStudent.grado_estudiante} -> ${gradoEstudiante}). Actualizando en la base de datos.`);
          const updateQuery = 'UPDATE estudiantes SET grado_estudiante = $1 WHERE documento_estudiante = $2';
          await pool.query(updateQuery, [gradoEstudiante, documentoEstudiante]);
        }
        console.log(`El estudiante con documento ${documentoEstudiante} ya existe en la base de datos. Se omitirá.`);
        continue;
      }

      // Insertar nuevo estudiante en la base de datos
      const insertQuery = 'INSERT INTO estudiantes (documento_estudiante, nombre_estudiante, grado_estudiante, institucion_estudiante) VALUES ($1, $2, $3, $4)';
      const insertValues = [documentoEstudiante, nombreCompleto, gradoEstudiante, sede];
      await pool.query(insertQuery, insertValues);
      console.log(`Se añadió el estudiante ${documentoEstudiante} a la base de datos.`);
    }

    // Eliminar estudiantes que ya no están en el archivo Excel
    for (const student of dbStudents.rows) {
      const documento = String(student.documento_estudiante); // Convertir a cadena por consistencia
      if (!excelDocuments.has(documento)) {
        console.log(`El estudiante con documento ${documento} ya no está en el archivo Excel. Se eliminará de la base de datos.`);

        // Primero eliminar registros relacionados en la tabla `padres` usando la `id` de la tabla `estudiantes`
        await pool.query('DELETE FROM padres WHERE hijo_id = $1', [student.id]);
        
        // Luego eliminar el estudiante de la tabla `estudiantes`
        await pool.query('DELETE FROM estudiantes WHERE id = $1', [student.id]);
      }
    }

    res.status(200).json({ message: 'Los datos del archivo Excel han sido procesados y guardados en la base de datos.' });
  } catch (error) {
    console.error('Error al procesar el archivo Excel:', error);
    res.status(500).json({ message: 'Error al procesar el archivo Excel.' });
  }
});

module.exports = router;