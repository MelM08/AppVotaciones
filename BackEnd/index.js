const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const auth = require('./src/auth/auth');

const crearEleccion = require('./src/crearEleccion/crearEleccion')

const subirExcelEstudiantes = require('./src/subirExcel/subirExcelEstudiantes');
const subirExcelPadres = require('./src/subirExcel/subirExcelPadres');
const subirExcelProfesores = require ('./src/subirExcel/SubirExcelProfesores');

const registrarEstudiantes = require('./src/registrarManualmente/registrarEstudiantes');
const registrarPadres = require('./src/registrarManualmente/registrarPadres');
const registrarProfesores = require('./src/registrarManualmente/registrarProfesores');

const buscarEstudiantes = require('./src/buscar/buscarEstudiante');
const buscarPadres = require('./src/buscar/buscarPadres');
const buscarProfesores = require('./src/buscar/buscarProfesores');
const buscarElecciones = require('./src/buscar/buscarElecciones');

const listarEstudiantes = require('./src/listar/listarEstudiantes');
const listarPadres = require('./src/listar/listarPadres');
const listarProfesores = require('./src/listar/listarProfesores');
const listarElecciones = require('./src/listar/listarElecciones');

const eliminarEstudiante = require('./src/eliminar/eliminarEstudiante');
const eliminarPadre = require('./src/eliminar/eliminarPadre');
const eliminarProfesor = require('./src/eliminar/eliminarProfesor');
const eliminarEleccion = require('./src/eliminar/eliminarEleccion');

const editarEstudiante = require('./src/editar/editarEstudiante');
const editarPadre = require('./src/editar/editarPadre');
const editarProfesor = require('./src/editar/editarProfesor');
const editarEleccion = require('./src/editar/editarEleccion');


app.use('/auth', auth);

app.use('/crearEleccion', crearEleccion);

app.use('/subirExcelEstudiantes', subirExcelEstudiantes);
app.use('/subirExcelPadres', subirExcelPadres);
app.use('/subirExcelProfesores', subirExcelProfesores);

app.use('/registrarEstudiantes', registrarEstudiantes);
app.use('/registrarPadres', registrarPadres);
app.use('/registrarProfesores', registrarProfesores);

app.use('/buscarEstudiantes', buscarEstudiantes);
app.use('/buscarPadres', buscarPadres);
app.use('/buscarProfesores', buscarProfesores);
app.use('/buscarElecciones', buscarElecciones);

app.use('/listarEstudiantes', listarEstudiantes);
app.use('/listarPadres', listarPadres);
app.use('/listarProfesores', listarProfesores);
app.use('/listarElecciones', listarElecciones);

app.use('/eliminarEstudiante', eliminarEstudiante);
app.use('/eliminarPadres', eliminarPadre);
app.use('/eliminarProfesor', eliminarProfesor);
app.use('/eliminarEleccion', eliminarEleccion);

app.use('/editarEstudiante', editarEstudiante);
app.use('/editarPadre', editarPadre);
app.use('/editarProfesor', editarProfesor);
app.use('/editarEleccion', editarEleccion);


app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});