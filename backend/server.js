require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
const path = require('path');
const estadoTienda = require('./src/middlewares/estadoTienda');

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST", "PATCH"] } });

app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

io.on('connection', (socket) => {
    console.log('🟢 Administrador conectado al sistema');
    socket.on('disconnect', () => console.log('🔴 Administrador desconectado'));
});

app.use('/', require('./src/routes/menu.routes'));
app.use('/', require('./src/routes/pedidos.routes')); 
app.use('/', require('./src/routes/admin.routes')); 

app.get('/api/estado', (req, res) => {
    const abierto = estadoTienda.estaAbierta();
    res.json({ abierto, mensaje: abierto ? "¡Estamos tomando pedidos!" : "Cinelandia se encuentra cerrado." });
});

server.listen(PORT, () => {
    console.log(`✅ Servidor Cinelandia activo en puerto ${PORT}`);
    console.log(`🚀 Arquitectura Modular Iniciada y funcionando`);
});