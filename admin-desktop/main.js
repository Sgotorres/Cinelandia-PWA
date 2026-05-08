const { app, BrowserWindow } = require('electron');

// URL de tu backend 
const API_URL = 'http://localhost:3000/api/admin/estado'; 

let mainWindow;

// 🚀 NUEVA FUNCIÓN SENIOR: Reintento Automático
async function notificarApertura(intentos = 5) {
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ abierto: true })
        });
        console.log("✅ Señal de APERTURA enviada al servidor con éxito.");
    } catch (error) {
        if (intentos > 0) {
            console.log(`⏳ Servidor calentando motores. Reintentando en 2 segundos... (Intentos restantes: ${intentos})`);
            setTimeout(() => notificarApertura(intentos - 1), 2000);
        } else {
            console.error("❌ No se pudo conectar al servidor tras varios intentos.");
        }
    }
}

app.whenReady().then(() => {
    // 1. Enviar señal al backend de que el cine ABRIÓ (usando reintentos)
    notificarApertura();

    // 2. Crear la ventana del programa para el admin
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true, 
    });

    // 3. Cargar la interfaz
    mainWindow.loadFile('../frontend/admin.html');
});

// 4. Interceptar cuando el admin cierra el programa
app.on('before-quit', async (event) => {
    event.preventDefault(); 
    
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ abierto: false })
        });
        console.log("🔴 Señal de CIERRE enviada al servidor.");
    } catch (error) { 
        console.error(error); 
    }

    app.exit(0); 
});