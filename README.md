# mockingbFront

Frontend del sistema **Mockingbird**, orientado a la visualización e interacción con endpoints HTTP simulados definidos por configuración. Este proyecto proporciona la interfaz de usuario para la gestión y consumo de servicios mockeados, y está diseñado para integrarse directamente con el backend de Mockingbird.

## Descripción general

El frontend permite trabajar con endpoints dinámicos configurados desde el backend, facilitando tareas de desarrollo, pruebas e integración sin depender de servicios reales.  
La aplicación se implementa como una **Single Page Application (SPA)** y utiliza un stack moderno basado en React y Vite.

## Requisitos del sistema

Para ejecutar el proyecto es necesario contar con:

- **Node.js** (versión 18 o superior)
- **npm**
- **Go** (requerido para el instalador de dependencias)
- Sistema operativo **Windows** (el instalador genera un archivo `.exe`)

## Instalación de dependencias

El proyecto incluye un script en Go que automatiza la preparación del entorno.

Desde la raíz del repositorio, ejecutar los siguientes comandos en orden:

```bash
go build -o install_deps.exe install_dependencies.go
.\install_deps.exe
