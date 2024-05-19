const { Pool } = require('pg');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx')

const app = express();
const port = 3000;


app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const config = {
  user: 'postgres',
  host: 'localhost',
  password: '1234',
  database: 'usuarios'
}

const pool = new Pool(config);




//VERIFICA EL USUARIO PARA EL LOGIN
//TENEMOS DOS LOQUITAS PARA INGRESO, SI EL QUE VA A INGRESAR ES USUARIO, BUSCA EN LAS TABLAS DE USUARIOS
//SINO, COMO CADA UNO TIENE UN LOGIN DISTINTO, VERIFICA EN LA TABLA DE ADMINISTRADORES

const verificarRol = async (req, res, next) => {
  try {
    const { id } = req.params;
    let rol = '';
      // Buscar en las tablas de usuarios
      const estudianteResult = await pool.query('SELECT documento_estudiante FROM estudiantes WHERE documento_estudiante = $1', [id]);
      const padreResult = await pool.query('SELECT documento_padre FROM padres WHERE documento_padre = $1', [id]);
      const docenteResult = await pool.query('SELECT documento_docente FROM docentes WHERE documento_docente = $1', [id]);

      //Con este if validamos si está en las tablas y le damos el rol de usuario, si no está, va al else
      if (estudianteResult.rows.length > 0 || padreResult.rows.length > 0 || docenteResult.rows.length > 0) {
          rol = 'usuario';
      } else {
          res.status(404).json({ error: '' });
          return;
      }
    req.userRole = rol;
    console.log({id, rol});
    next();

  } catch (e) {
    console.error('Error al verificar el rol del usuario:', e);
    res.status(500).json({ error: 'Error al verificar el rol del usuario' });
  }
}

//FUNCIÓN PARA VERIFICAR SI ESTÁ EN LAS TABLAS
app.get('/usuario/:id', verificarRol, (req, res) => {
  res.json({ userRole: req.userRole });
});



const verificarRolAdmin = async (req, res, next) => {
  try {
    const { id, password } = req.body; // Recibimos también la contraseña desde el frontend
    const adminResult = await pool.query('SELECT id_administrador FROM administrador WHERE id_administrador = $1 AND contraseña = $2', [id, password]);

    //en este if validamos si está en la tabla de administradores los datos, sino, va al else
    if (adminResult.rows.length > 0) {
      req.userRole = 'admin';
      console.log({ id, rol: 'admin' });
      next();
    } else {
      res.status(404).json({ error: 'Credenciales de administrador incorrectas' });
    }

  } catch (e) {
    console.error('Error al verificar el rol del administrador:', e);
    res.status(500).json({ error: 'Error al verificar el rol del administrador' });
  }
}

//FUNCIÓN PARA VERIFICAR SI ESTÁ EN LA TABLA ADMIN
app.post('/admin', verificarRolAdmin, (req, res) => {
  res.json({ userRole: req.userRole });
});












//CARGAR EXCEL'S A LA BASE DE DATOS







//CARGAR ARCHIVO BASE DE DATOS ESTUDIANTES


app.post('/subir-excel-estudiantes', async (req, res) => {
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





  //CARGAR ARCHIVO BASE DE DATOS PADRES





app.post('/subir-excel-padres', async (req, res) => {
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





  //CARGAR ARCHIVO BASE DE DATOS PROFESORES





app.post('/subir-excel-profesores', async (req, res) => {
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













  //CARGAR MANUALMENTE A LAS TABLAS








  //CARGAR ESTUDIANTE MANUALMENTE




app.post('/registrar-estudiante', async (req, res) => {
  try {
    const { documento, nombre, apellido, grado, sede } = req.body;

    // Verificar si algún campo está vacío
    if (!documento || !nombre || !apellido || !grado || !sede) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Verificar si el estudiante ya existe en la base de datos
    const existingStudentQuery = 'SELECT documento_estudiante FROM estudiantes WHERE documento_estudiante = $1';
    const existingStudent = await pool.query(existingStudentQuery, [documento]);
    if (existingStudent.rows.length > 0) {
        return res.status(401).json({ message: 'El estudiante ya existe en la base de datos.' });
    }

    // Insertar los datos del estudiante en la base de datos
    const insertQuery = 'INSERT INTO estudiantes (documento_estudiante, nombre_estudiante, apellido_estudiante, grado_estudiante, institucion_estudiante) VALUES ($1, $2, $3, $4, $5)';
    const insertValues = [documento, nombre, apellido, grado, sede];
    await pool.query(insertQuery, insertValues);

    res.status(200).json({ message: 'Estudiante guardado correctamente en la base de datos.' });
  } catch (error) {
    console.error('Error al guardar el estudiante:', error);
    res.status(500).json({ message: 'Error al guardar el estudiante en la base de datos.' });
  }
});




  //  CARGAR PADRE MANUALMENTE




app.post('/registrar-padre', async (req, res) => {
  const { documentoEstudiante, documentoPadre, nombrePadre, apellidoPadre } = req.body;

  try {
    // Verificar si el estudiante existe en la base de datos
    const estudianteQuery = 'SELECT * FROM estudiantes WHERE documento_estudiante = $1';
    const estudianteResult = await pool.query(estudianteQuery, [documentoEstudiante]);
    if (estudianteResult.rows.length === 0) {
      return res.status(400).json({ message: 'El estudiante no existe en la base de datos.' });
    }

    // Verificar si el padre ya está registrado
    const padreQuery = 'SELECT * FROM padres WHERE documento_padre = $1';
    const padreResult = await pool.query(padreQuery, [documentoPadre]);
    if (padreResult.rows.length > 0) {
      return res.status(401).json({ message: 'El padre ya está registrado en la base de datos.' });
    }

    // Insertar el padre en la base de datos
    const insertQuery = 'INSERT INTO padres (hijo_id, documento_padre, nombre_padre, apellido_padre) VALUES ($1, $2, $3, $4)';
    await pool.query(insertQuery, [documentoEstudiante, documentoPadre, nombrePadre, apellidoPadre]);

    // Respuesta exitosa
    res.status(200).json({ message: 'Padre registrado exitosamente.' });
  } catch (error) {
    console.error('Error al registrar padre:', error);
    res.status(500).json({ message: 'Error al registrar padre.' });
  }
});
  



  //CARGAR PROFESOR MANUALMENTE



app.post('/registrar-profesor', async (req, res) => {
  try {
    const { documento, nombre, apellido, sede } = req.body;

    // Verificar si algún campo está vacío
    if (!documento || !nombre || !apellido || !sede) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Verificar si el profesor ya existe en la base de datos
    const profesorExistenteQuery = 'SELECT documento_docente FROM docentes WHERE documento_docente = $1';
    const profesorExistente = await pool.query(profesorExistenteQuery, [documento]);
    if (profesorExistente.rows.length > 0) {
        return res.status(401).json({ message: 'El profesor ya existe en la base de datos.' });
    }

    // Insertar los datos del profesor en la base de datos
    const insertarQuery = 'INSERT INTO docentes (documento_docente, nombre_docente, apellido_docente, institucion_docente) VALUES ($1, $2, $3, $4)';
    const insertarValues = [documento, nombre, apellido, sede];
    await pool.query(insertarQuery, insertarValues);

    res.status(200).json({ message: 'Profesor guardado correctamente en la base de datos.' });
  } catch (error) {
    console.error('Error al guardar el profesor:', error);
    res.status(500).json({ message: 'Error al guardar el profesor en la base de datos.' });
  }
});
  

// CREAR UNA ELECCION

app.post('/crear-eleccion', async (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { nombre, ano, estado } = req.body;

  // Verificar si algún campo está vacío
  if (!nombre || !ano || !estado) {
    return res.status(400).json({ error: 'Por favor, complete todos los campos.' });
  }

  try {
    // Query para insertar la nueva elección en la tabla 'elecciones'
    const query = 'INSERT INTO elecciones (nombre, ano, estado) VALUES ($1, $2, $3)';
    const values = [nombre, ano, estado];

    // Ejecutar la consulta SQL
    await pool.query(query, values);

    // Responder con un mensaje de éxito
    res.status(200).json({ message: 'Elección creada con éxito' });
  } catch (error) {
    // Si hay algún error al guardar en la base de datos, responder con un error 500
    console.error(error);
    res.status(500).json({ error: 'Error al crear la elección en la base de datos.' });
  }
});








  //BUSCAR EN LAS TABLAS








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





  //BUSCAR ESTUDIANTES






app.post('/buscar-estudiantes', async (req, res) => {
  const { termino } = req.body;

  try {
    let query = 'SELECT * FROM estudiantes WHERE';

    //validamos primero si el termino contiene un '-', entonces es un grado, si es un número y empieza con N, es un documento, 
    //si es un número, es un documento, si no, es un nombre o apellido
    if (termino) {
      if (termino.includes('-')) {
        query += ` grado_estudiante ILIKE '${termino}%'`;
      } else if ((termino.startsWith('N') || termino.startsWith('n')) && !isNaN(Number(termino.substr(1)))) {
        query += ` documento_estudiante ILIKE '%${termino}%'`;
      } else if (!isNaN(Number(termino))) {
        query += ` documento_estudiante ILIKE '%${termino}%'`;
      } else {
        const palabras = termino.split(' ');

        if (palabras.length === 1) {
          query += ` (nombre_estudiante ILIKE '%${palabras[0]}%' OR apellido_estudiante ILIKE '%${palabras[0]}%')`;
        } else {
          const combinaciones = generarCombinaciones(palabras);
          query += ` (${combinaciones.map(({ nombre, apellido }) => `(nombre_estudiante ILIKE '%${nombre}%' AND apellido_estudiante ILIKE '%${apellido}%') OR (nombre_estudiante ILIKE '%${apellido}%' AND apellido_estudiante ILIKE '%${nombre}%')`).join(' OR ')})`;
        }
      }
    } else {
      return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda' });
    }

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al buscar estudiantes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});





  //BUSCAR PADRES



  
app.post('/buscar-padres', async (req, res) => {
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
  
  




// BUSCAR PROFESORES





app.post('/buscar-profesores', async (req, res) => {
  const { termino } = req.body;

  try {
    let query = 'SELECT * FROM docentes WHERE';

    //validamos primero si el termino contiene un '-', entonces es un grado, si es un número y empieza con N, es un documento, 
    //si es un número, es un documento, si no, es un nombre o apellido
    if (termino) {
      if (termino.includes('-')) {
        query += ` documento_docente ILIKE '${termino}%'`;
      } else if ((termino.startsWith('N') || termino.startsWith('n')) && !isNaN(Number(termino.substr(1)))) {
        query += ` documento_docente ILIKE '%${termino}%'`;
      } else if (!isNaN(Number(termino))) {
        query += ` documento_docente ILIKE '%${termino}%'`;
      } else {
        const palabras = termino.split(' ');

        if (palabras.length === 1) {
          query += ` (nombre_docente ILIKE '%${palabras[0]}%' OR apellido_docente ILIKE '%${palabras[0]}%')`;
        } else {
          const combinaciones = generarCombinaciones(palabras);
          query += ` (${combinaciones.map(({ nombre, apellido }) => `(nombre_docente ILIKE '%${nombre}%' AND apellido_docente ILIKE '%${apellido}%') OR (nombre_docente ILIKE '%${apellido}%' AND apellido_docente ILIKE '%${nombre}%')`).join(' OR ')})`;
        }
      }
    } else {
      return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda' });
    }

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al buscar profesores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// BUSCAR ELECCIONES

app.post('/buscar-eleccion', async (req, res) => {
  try {
    // Realiza la consulta SQL para obtener las elecciones
    const query = 'SELECT id, nombre FROM elecciones'; 
    const result = await pool.query(query);

    // Envía los resultados como respuesta
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener las elecciones:', error);
    res.status(500).json({ message: 'Error al obtener las elecciones.' });
  }
});









//CONSULTAS PARA EDITAR O ELIMINAR









//EDITAR ESTUDIANTE




app.put('/editar-estudiante', async (req, res) => {
const { estudiante } = req.body;

if (!estudiante) {
  return res.status(400).json({ error: 'No se ha inicializado el estudiante correctamente.' });
}

try {
  //actualizar datos
  await pool.query(`UPDATE estudiantes SET nombre_estudiante = $1, apellido_estudiante = $2, grado_estudiante = $3, institucion_estudiante = $4 WHERE documento_estudiante = $5`,
    [estudiante.nombre_estudiante, estudiante.apellido_estudiante, estudiante.grado_estudiante, estudiante.institucion_estudiante, estudiante.documento_estudiante]);

    res.json({ message: 'Estudiante actualizado' });
  } catch (error) {
    console.error('Error al editar estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


//ELIMINAR ESTUDIANTE


app.delete('/eliminar-estudiante/:documento', async (req, res) => {
  const documento = req.params.documento;

  try {
    // Eliminar padres relacionados con el estudiante
    await pool.query('DELETE FROM padres WHERE hijo_id = $1', [documento]);

    // Eliminar el estudiante
    await pool.query('DELETE FROM estudiantes WHERE documento_estudiante = $1', [documento]);

    res.json({ message: 'Estudiante y padres relacionados eliminados' });
  } catch (error) {
    console.error('Error al eliminar estudiante y padres relacionados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});




//EDITAR PADRES




app.put('/editar-padre', async (req, res) => {
  const { padre } = req.body;
  console.log("Padre recibido:", padre);

  if (!padre) {
    return res.status(400).json({ error: 'No se ha inicializado el padre correctamente.' });
  }

  try {
    await pool.query(
      `UPDATE padres SET documento_padre = $1, nombre_padre = $2, apellido_padre = $3 WHERE id = $4`,
      [padre.documento_padre, padre.nombre_padre, padre.apellido_padre, padre.id]
    );

    res.json({ message: 'Padre actualizado' });
  } catch (error) {
    console.error('Error al editar padre:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


//ELIMINAR PADRES


app.delete('/eliminar-padre/:documento', async (req, res) => {
  const documento = req.params.documento;

  try {
    await pool.query('DELETE FROM padres WHERE documento_padre = $1', [documento]);
    res.json({ message: 'Padre eliminado' });
  } catch (error) {
    console.error('Error al eliminar Padre:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});





//EDITAR PROFESORES



app.put('/editar-profesor', async (req, res) => {
  const { profesor } = req.body;
  console.log("Profesor recibido:", profesor);

  if (!profesor) {
    return res.status(400).json({ error: 'No se ha inicializado el profesor correctamente.' });
  }

  try {
    await pool.query(
      `UPDATE docentes SET documento_docente = $1, nombre_docente = $2, apellido_docente = $3, institucion_docente = $4 WHERE id = $5`,
      [profesor.documento_docente, profesor.nombre_docente, profesor.apellido_docente, profesor.institucion_docente, profesor.id]
    );

    res.json({ message: 'Profesor actualizado' });
  } catch (error) {
    console.error('Error al editar profesor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// EDITAR ELECCION

app.put('/editar-eleccion', async (req, res) => {
  const { eleccion } = req.body;

  if (!eleccion) {
    return res.status(400).json({ error: 'No se ha inicializado la elección correctamente.' });
  }

  try {
    // Actualizar datos
    await pool.query(`UPDATE elecciones SET nombre = $1, otra_propiedad = $2 WHERE id = $3`,
      [eleccion.nombre, eleccion.otra_propiedad, eleccion.id]);

    res.json({ message: 'Eleccion actualizada' });
  } catch (error) {
    console.error('Error al editar elección:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ELIMINAR ELECCION

app.delete('/eliminar-eleccion/:id', async (req, res) => {
  const id = req.params.id;

  try {
    // Eliminar la elección
    await pool.query('DELETE FROM elecciones WHERE id = $1', [id]);

    res.json({ message: 'Eleccion eliminada' });
  } catch (error) {
    console.error('Error al eliminar elección:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


//ELIMINAR PROFESORES

  
app.delete('/eliminar-profesor/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query('DELETE FROM docentes WHERE id = $1', [id]);
    res.json({ message: 'Profesor eliminado' });
  } catch (error) {
    console.error('Error al eliminar Profesor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


app.get('/listar-elecciones', async (req, res) => {
  try {
    // Realiza la consulta SQL para obtener las elecciones
    const query = 'SELECT * FROM elecciones';
    const result = await pool.query(query);

    // Envía los resultados como respuesta
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener las elecciones:', error);
    res.status(500).json({ message: 'Error al obtener las elecciones.' });
  }
});

app.get('/listar-estudiantes', async (req, res) => {
  try {
    // Realiza la consulta SQL para obtener las elecciones
    const query = 'SELECT * FROM estudiantes';
    const result = await pool.query(query);

    // Envía los resultados como respuesta
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los estudiantes:', error);
    res.status(500).json({ message: 'Error al obtener los estudiantes.' });
  }
});

app.get('/listar-padres', async (req, res) => {
  try {
    // Realiza la consulta SQL para obtener las elecciones
    const query = 'SELECT * FROM padres';
    const result = await pool.query(query);

    // Envía los resultados como respuesta
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los padres:', error);
    res.status(500).json({ message: 'Error al obtener los padres.' });
  }
});

app.get('/listar-docentes', async (req, res) => {
  try {
    // Realiza la consulta SQL para obtener las elecciones
    const query = 'SELECT * FROM docentes';
    const result = await pool.query(query);

    // Envía los resultados como respuesta
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los docentes:', error);
    res.status(500).json({ message: 'Error al obtener los docentes.' });
  }
});


// App running console log alert

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});



