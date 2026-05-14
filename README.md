# 🪐 Cinelandia PWA - Sistema Galáctico de Pedidos

Este sistema es una solución integral para la gestión de pedidos en mesa y cocina, diseñado con una arquitectura moderna de microservicios y capacidades de aplicación web progresiva (PWA).

## 🚀 Estructura del Proyecto

El sistema se divide en tres módulos principales:
1.  **Backend**: API REST y servidor de WebSockets construido con Node.js y Express.
2.  **Frontend (PWA)**: Interfaz del cliente para realizar pedidos desde la mesa vía QR.
3.  **Admin Desktop**: Panel administrativo nativo construido con Electron para control de inventario y cocina.

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
* [Node.js (LTS)](https://nodejs.org/)
* [PostgreSQL](https://www.postgresql.org/) (Configurado con una base de datos llamada `sistemas_pedidos_db`)
* [Git](https://git-scm.com/)

---

## 📦 Instalación y Configuración Rápidas

Para que el sistema funcione correctamente en tu máquina local, debes instalar las dependencias en cada carpeta. Sigue estos pasos en tu terminal:

### 1. Clonar el repositorio
```bash
git clone https://github.com/Sgotorres/Cinelandia-PWA.git
cd Cinelandia-PWA

    2. Variables de Entorno

Crea un archivo llamado .env dentro de la carpeta backend/ y configura tus credenciales locales de PostgreSQL:

DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=sistemas_pedidos_db
DB_HOST=localhost
DB_PORT=5432

    3. Instalación Global

Abre tu terminal en la raíz del proyecto (carpeta Cinelandia-PWA) e instala todas las dependencias del backend y del panel administrador con un solo comando:

pnpm install

    🚀 Ejecución del Sistema

Para encender todos los motores de Cinelandia (Backend, Frontend y Panel de Administrador), abre la terminal en la raíz del proyecto y ejecuta:

pnpm start

    ¿Qué sucede al ejecutar este comando?

1. Se levanta el servidor Node.js en el puerto 3000.
2. El servidor sirve automáticamente la interfaz web (PWA) del cliente en http://localhost:3000.
3. Se abre automáticamente la aplicación de escritorio nativa (Electron).
4. El sistema notifica la apertura del restaurante en tiempo real.