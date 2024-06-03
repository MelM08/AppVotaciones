select * from estudiantes
select * from padres
select * from docentes
select * from administrador
select * from elecciones
select * from estamentos
select * from candidatos


create table administrador(
	id SERIAL PRIMARY KEY,
	id_administrador varchar(50) NOT NULL,
	contraseña varchar(50) NOT NULL
);

create table estudiantes(
	id SERIAL PRIMARY KEY,
	documento_estudiante varchar(50) NOT NULL,
	nombre_estudiante varchar(50) NOT NULL,
	grado_estudiante varchar(50) NOT NULL,
	institucion_estudiante varchar(100) NOT NULL
);

create table padres(
	id SERIAL PRIMARY KEY,
	hijo_id SERIAL NOT NULL,
	documento_padre varchar(50) NOT null,
	nombre_padre varchar(50) NOT null,
	foreign key (hijo_id) references estudiantes(id)
);

create table docentes(
	id SERIAL PRIMARY KEY,	
	documento_docente varchar(50) NOT null,
	nombre_docente varchar(50) NOT null
);

create table elecciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    ano VARCHAR(255),
	estado VARCHAR(255)
);

create table estamentos (
    id SERIAL PRIMARY KEY,
	id_eleccion INTEGER REFERENCES elecciones(id),
    nombre VARCHAR(255),
    grados_habilitados VARCHAR(255),
    rol_habilitado_para_votar VARCHAR(255),
	estado VARCHAR(255)
);

create table candidatos (
    id SERIAL PRIMARY KEY,
	id_estamento INTEGER REFERENCES estamentos(id),
    nombre VARCHAR(255),
    descripcion VARCHAR(255),
    id_foto VARCHAR(255),
    numero VARCHAR(255),
	estado VARCHAR(255)
);