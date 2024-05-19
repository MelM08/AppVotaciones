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


router.post('/subir-excel-estudiantes', async (req, res) => {
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
      const [documento, nombre, apellido, grado, sede] = excelData[0];
      if (documento !== 'Documento' || nombre !== 'Nombre' || apellido !== 'Apellido' || grado !== 'Grado' || sede !== 'Sede') {
        return res.status(401).json({ message: 'La estructura del archivo Excel no es válida.' });
      }
  
      // Validar el formato del grado en cada fila de datos
      const gradoPattern =  /^(?:[1-9]|1[0-1])-(?:[1-9]|[1-9][0-9])$/;
      for (let i = 1; i < excelData.length; i++) {
        const [documentoEstudiante, nombreEstudiante, apellidoEstudiante, gradoEstudiante, institucionEstudiante] = excelData[i];
      }
    
      // Obtener todos los estudiantes de la base de datos
      const dbStudentsQuery = 'SELECT documento_estudiante, grado_estudiante FROM estudiantes';
      const dbStudents = await pool.query(dbStudentsQuery);
    
      // Lista para almacenar los documentos de los estudiantes del archivo Excel
      const excelDocuments = new Set();
    
      // Procesar los datos del archivo Excel a partir de la segunda fila
      for (let i = 1; i < excelData.length; i++) {
        let [documentoEstudiante, nombreEstudiante, apellidoEstudiante, gradoEstudiante, institucionEstudiante] = excelData[i];
    
        // Verificar si documentoEstudiante no es una cadena y convertirlo a cadena si es necesario
        if (typeof documentoEstudiante !== 'string') {
          documentoEstudiante = String(documentoEstudiante);
        }
  
        // Verificar si algún campo está vacío
        if (!documentoEstudiante || !nombreEstudiante || !apellidoEstudiante || !gradoEstudiante || !institucionEstudiante) {
          console.log(`La fila ${i + 1} contiene un campo vacío. Se ignorará.`);
          continue; // Saltar al siguiente ciclo sin insertar datos en la base de datos
        }
            
        // Verificar si el formato del grado no es válido
        if (!gradoPattern.test(gradoEstudiante)) {
          console.log(`Formato de grado inválido en la fila ${i + 1}. Debe ser en el formato X-X, por ejemplo, 7-1.` );
          continue;
        }
  
        // Guardar el documento del estudiante en la lista
        excelDocuments.add(documentoEstudiante);
    
        // Verificar si el estudiante ya existe en la base de datos
        const existingStudentQuery = 'SELECT documento_estudiante FROM estudiantes WHERE documento_estudiante = $1';
        const existingStudent = await pool.query(existingStudentQuery, [documentoEstudiante]);
    
        // Si el estudiante ya existe, verificar si cambió de grado
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
    
        // Insertar los datos en la base de datos
        const insertQuery = 'INSERT INTO estudiantes (documento_estudiante, nombre_estudiante, apellido_estudiante, grado_estudiante, institucion_estudiante) VALUES ($1, $2, $3, $4, $5)';
        const insertValues = [documentoEstudiante, nombreEstudiante, apellidoEstudiante, gradoEstudiante, institucionEstudiante];
        await pool.query(insertQuery, insertValues);
        console.log(`Se añadió el estudiante ${documentoEstudiante} al archivo`);
      }
    
      // Verificar si algún estudiante de la base de datos no está en el archivo Excel y borrarlo
      for (const student of dbStudents.rows) {
        if (!excelDocuments.has(student.documento_estudiante)) {
          console.log(`El estudiante con documento ${student.documento_estudiante} ya no está en el archivo Excel. Se eliminará de la base de datos.`);
    
          // Eliminar primero las referencias en la tabla `padres`
          await pool.query('DELETE FROM padres WHERE hijo_id = $1', [student.documento_estudiante]);
          // Luego eliminar al estudiante de la tabla `estudiantes`
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