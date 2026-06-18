const { app, BrowserWindow } = require('electron');

const API_BASE = 'http://localhost:3000'; 
const SYSTEM_SECRET = "cinelandia2026"; // La misma clave maestra del frontend

let mainWindow;

// 🚀 FUNCIÓN SENIOR: Login M2M y Notificación
async function notificarApertura(intentos = 5) {
    try {
        // 1. Obtener Token
        const loginRes = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: SYSTEM_SECRET })
        });
        const { token } = await loginRes.json();

        // 2. Enviar señal con el Token
        await fetch(`${API_BASE}/api/admin/estado`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ abierto: true })
        });
        console.log("✅ Señal de APERTURA SEGURA enviada al servidor.");
    } catch (error) {
        if (intentos > 0) {
            console.log(`⏳ Servidor calentando motores. Reintentando... (Intentos restantes: ${intentos})`);
            setTimeout(() => notificarApertura(intentos - 1), 2000);
        } else {
            console.error("❌ No se pudo conectar al servidor.");
        }
    }
}

app.whenReady().then(() => {
    notificarApertura();

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true, 
    });

    mainWindow.loadFile('../frontend/admin.html');
});

app.on('before-quit', async (event) => {
    event.preventDefault(); 
    
    try {
        const loginRes = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: SYSTEM_SECRET })
        });
        const { token } = await loginRes.json();

        await fetch(`${API_BASE}/api/admin/estado`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ abierto: false })
        });
        console.log("🔴 Señal de CIERRE SEGURA enviada al servidor.");
    } catch (error) { 
        console.error("Error al cerrar tienda:", error); 
    }

    app.exit(0); 
});