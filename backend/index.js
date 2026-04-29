const express = require('express');
const cors = require('cors');
const pool = require('./db');
const http = require('http'); // Necesario para Socket.io
const { Server } = require('socket.io'); // Importamos el servidor de sockets
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Configuración del Servidor HTTP y WebSockets
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // En desarrollo permitimos todo
        methods: ["GET", "POST", "PATCH"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// 2. Gestión de conexiones en tiempo real
io.on('connection', (socket) => {
    console.log('🟢 Administrador conectado al sistema');
    socket.on('disconnect', () => {
        console.log('🔴 Administrador desconectado');
    });
});

// --- RUTA 1: OBTENER EL MENÚ ---
// Modificada: Ahora acepta un parámetro ?admin=true para ver todo, 
// de lo contrario solo muestra lo disponible para el cliente.
app.get('/menu', async (req, res) => {
    const isAdmin = req.query.admin === 'true';
    try {
        let query = 'SELECT * FROM productos';
        if (!isAdmin) {
            query += ' WHERE disponible = true'; // El cliente no ve lo agotado
        }
        query += ' ORDER BY categoria ASC, nombre ASC';
        
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener el menú:', err.message);
        res.status(500).json({ error: "Error al cargar el menú" });
    }
});

// --- RUTA 2: RECIBIR PEDIDOS ---
app.post('/pedidos', async (req, res) => {
    const { carrito, mesa } = req.body;
    
    if (!carrito || carrito.length === 0 || !mesa) {
        return res.status(400).json({ error: "Faltan datos en el pedido" });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const total = carrito.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

        const pedidoRes = await client.query(
            'INSERT INTO pedidos (mesa, total, estado) VALUES ($1, $2, $3) RETURNING id',
            [mesa, total, 'pendiente']
        );
        
        const pedidoId = pedidoRes.rows[0].id;

        // --- DENTRO DE app.post('/pedidos', ...) ---
        for (const item of carrito) {
            await client.query(
                'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, talla) VALUES ($1, $2, $3, $4, $5)',
                [pedidoId, item.producto_id, item.cantidad, item.precio_unitario, item.talla] // <--- Añadimos item.talla
            );
        }
        await client.query('COMMIT');

        // 🔔 NOTIFICACIÓN EN TIEMPO REAL: Avisamos al admin que llegó un pedido
        io.emit('nuevo_pedido_recibido', { id: pedidoId, mesa: mesa });

        res.status(201).json({ mensaje: 'Pedido recibido', pedidoId });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: "Error interno" });
    } finally {
        client.release();
    }
});

// --- RUTA 3: PANEL ADMIN (PEDIDOS ACTIVOS) ---
app.get('/admin/pedidos', async (req, res) => {
    try {
        const query = `
            SELECT p.id, p.mesa, p.total, p.estado, p.fecha,
                   json_agg(json_build_object(
                       'nombre', pr.nombre,
                       'cantidad', dp.cantidad
                   )) as items
            FROM pedidos p
            JOIN detalles_pedido dp ON p.id = dp.pedido_id
            JOIN productos pr ON dp.producto_id = pr.id
            WHERE p.estado != 'finalizado'
            GROUP BY p.id
            ORDER BY p.fecha DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});

// --- RUTA 4: ESTADÍSTICAS ---
app.get('/admin/stats-hoy', async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as total_pedidos,
                COALESCE(SUM(total), 0) as ingresos_totales,
                (SELECT pr.nombre 
                 FROM detalles_pedido dp 
                 JOIN productos pr ON dp.producto_id = pr.id 
                 JOIN pedidos p2 ON dp.pedido_id = p2.id
                 WHERE p2.fecha::date = CURRENT_DATE
                 GROUP BY pr.nombre 
                 ORDER BY SUM(dp.cantidad) DESC 
                 LIMIT 1) as top_producto
            FROM pedidos 
            WHERE fecha::date = CURRENT_DATE;
        `;
        const result = await pool.query(query);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error en estadísticas" });
    }
});

// --- ACTUALIZAR ESTADO DEL PEDIDO ---
app.patch('/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        await pool.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, id]);
        res.json({ mensaje: 'Estado actualizado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

// --- ACTUALIZAR PRODUCTO (RECOMENDADOS Y DISPONIBILIDAD) ---
app.patch('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { es_recomendado, disponible } = req.body;
    
    try {
        // Esta ruta ahora es dinámica: puede actualizar recomendados o disponibilidad
        if (es_recomendado !== undefined) {
            await pool.query('UPDATE productos SET es_recomendado = $1 WHERE id = $2', [es_recomendado, id]);
        }
        if (disponible !== undefined) {
            await pool.query('UPDATE productos SET disponible = $1 WHERE id = $2', [disponible, id]);
        }
        res.json({ mensaje: 'Producto actualizado con éxito' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// --- RUTA 5: RASTREAR PEDIDO (CLIENTE) ---
app.get('/pedidos/:id/estado', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT estado FROM pedidos WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }
        
        // Devolvemos si está pendiente, cocinando, listo o finalizado
        res.json({ estado: result.rows[0].estado });
    } catch (err) {
        res.status(500).json({ error: "Error de telemetría" });
    }
});

// 3. Iniciar el servidor usando 'server' en lugar de 'app'
server.listen(PORT, () => {
    console.log(`✅ Servidor Cinelandia activo en puerto ${PORT}`);
    console.log(`🚀 Tiempo real activado con Socket.io`);
});