# Aplicación de Elecciones Estudiantiles

## Descripción
Esta es una aplicación web para la gestión de elecciones estudiantiles, desarrollada con Angular para el frontend y Node.js para el backend. La base de datos utilizada es PostgreSQL.

## Requisitos Previos
- Node.js instalado en su sistema.
- Angular CLI instalado en su sistema.
- PostgreSQL instalado y configurado en su sistema.
- Git instalado en su sistema.

## Instrucciones de Instalación y Configuración

### 1. Clonar el Repositorio
Para obtener el código fuente de la aplicación, debe clonar el repositorio de GitHub:

- git clone https://github.com/MelM08/AppVotaciones.git

### 2. Configurar la Base de Datos
Crear una base de datos en PostgreSQL.

Las tablas se encuentran dentro del archivo BD.sql

Configurar la conexión a la base de datos en el archivo configDB.js ubicado en el directorio del backend. Asegúrese de modificar el nombre de la base de datos y la contraseña si es necesario.

### 3. Instalar Dependencias
- Frontend
    Navegar al directorio del frontend:
        cd AppVotaciones/frontend

    Instalar las dependencias necesarias:
        npm install

- Backend
    Navegar al directorio del backend:
    cd AppVotaciones/backend

## Instrucciones de Compilación y Ejecución

#### 1. Compilar y Ejecutar el Frontend

Navegar al directorio del frontend:
    cd AppVotaciones/frontend
    Ejecutar el siguiente comando para compilar y servir la aplicación Angular:
    ng serve -o

### 2. Ejecutar el Backend
    Navegar al directorio del backend:
    cd AppVotaciones/backend
    Ejecutar el siguiente comando para iniciar el servidor Node.js:
    node index.js

## Rutas de la Aplicación
    Votante: http://localhost:4200/login
    Administrador: http://localhost:4200/admin

## Notas Adicionales

    Asegúrese de estar registrado en la base de datos para poder iniciar sesión en la aplicación.
    Todo el desarrollo y la ejecución se realiza de manera local.

## Uso de Git

Git es una herramienta de control de versiones que le permite rastrear cambios en su código fuente y colaborar con otros desarrolladores. A continuación, se presentan algunos comandos básicos de Git:

### Clonar un Repositorio
Para obtener una copia local de un repositorio remoto:
    git clone <repository-url>

Para actualizar su copia local con los últimos cambios del repositorio remoto:
    git pull

Este archivo README.txt proporciona instrucciones claras y detalladas para la instalación, compilación y ejecución de la aplicación, junto con una introducción a Git y sus principales comandos.