const { Pool } = require('pg');
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const router = express.Router();
const config = require('../../configDB');

const pool = new Pool(config);

router.use(fileUpload());

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
        if (estudianteResult.rows.length > 0) {
            rol = 'estudiante';
        }else if(padreResult.rows.length > 0){
            rol = 'padre';
        }else if(docenteResult.rows.length > 0){
          rol = 'docente';
        }else {
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
  router.get('/usuario/:id', verificarRol, (req, res) => {
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
  router.post('/admin', verificarRolAdmin, (req, res) => {
    res.json({ userRole: req.userRole });
  });
  

module.exports = router;