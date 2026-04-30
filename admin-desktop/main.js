const { app, BrowserWindow } = require('electron');

// URL de tu backend (Ajustar a la URL de producción cuando lo suban a la nube)
const API_URL = 'http://localhost:3000/api/admin/estado'; 

let mainWindow;

app.whenReady().then(async () => {
    // 1. Enviar señal al backend de que el cine ABRIÓ
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ abierto: true })
        });
    } catch (error) { 
        console.error("Error conectando al servidor:", error); 
    }

    // 2. Crear la ventana del programa para el admin
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true, // Oculta las barras superiores para que luzca nativo
    });

    // 3. Cargar la interfaz de Eduardo. 
    // Si ya tienen la PWA en internet, usarías mainWindow.loadURL('https://tu-dominio.com/admin.html')
    // Como estamos en desarrollo local, cargamos el archivo localmente:
    mainWindow.loadFile('../frontend/admin.html');
});

// 4. Interceptar cuando el admin cierra el programa
app.on('before-quit', async (event) => {
    event.preventDefault(); 
    
    // Enviar señal al backend de que el cine CERRÓ
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ abierto: false })
        });
    } catch (error) { 
        console.error(error); 
    }

    app.exit(0); // Forzar el cierre definitivo
});