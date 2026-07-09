require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
const path = require('path');
const pool = require('./db'); // <-- AQUÍ IMPORTAMOS LA BASE DE DATOS

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST", "PATCH"] } });

app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

io.on('connection', (socket) => {
    console.log('🟢 Dispositivo conectado al sistema');
    
    // Todos se unen a una sala general (por ahora)
    socket.join('admin-room'); 

    // NUEVO: Escuchar cuando una tablet cambia el estado de una mesa
    socket.on('actualizar_estado_mesa', (data) => {
        // data contiene: { id: 1, estado: 'esperando' }
        // Se lo reenviamos a TODOS los demás dispositivos excepto al que originó el cambio
        socket.broadcast.emit('sincronizar_mesa', data);
    });

    socket.on('disconnect', () => console.log('🔴 Dispositivo desconectado'));
});

app.use('/', require('./src/routes/menu.routes'));
app.use('/', require('./src/routes/pedidos.routes')); 
app.use('/', require('./src/routes/admin.routes')); 

// AHORA LEEMOS EL ESTADO DIRECTO DE POSTGRESQL
app.get('/api/estado', async (req, res) => {
    try {
        const result = await pool.query("SELECT valor FROM configuracion_sistema WHERE clave = 'estado_tienda'");
        
        // Extraemos el valor JSON. Si por alguna razón no existe, por defecto es falso (cerrado)
        const abierto = result.rows.length > 0 ? result.rows[0].valor.abierta : false;
        
        res.json({ abierto, mensaje: abierto ? "¡Estamos tomando pedidos!" : "Cinelandia se encuentra cerrado." });
    } catch (err) {
        console.error("Error al consultar estado de la tienda:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Al agregar '0.0.0.0', permitimos conexiones desde otras máquinas en la misma red Wi-Fi
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Para conectarte desde la tablet u otro equipo, usa tu IP Local.`);
});