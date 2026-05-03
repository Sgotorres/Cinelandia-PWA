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

    2. Configurar el backend

cd backend
npm install
# Crea un archivo .env basado en el .env.example y configura tus credenciales de Postgres
npm start

    3. Configurar el Panel de Administrador (Desktop)

cd admin-desktop
npm install
npm start

    4. Fronted

cd frontend
npx serve