const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- RUTA 1: OBTENER EL MENÚ ---
app.get('/menu', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos ORDER BY categoria ASC, nombre ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener el menú:', err.message);
        res.status(500).json({ error: "Error al cargar el menú" });
    }
});

// --- RUTA 2: RECIBIR PEDIDOS DESDE LA MESA ---
app.post('/pedidos', async (req, res) => {
    // Usamos 'mesa' para ser genéricos
    const { carrito, mesa } = req.body; 
    
    if (!carrito || carrito.length === 0 || !mesa) {
        return res.status(400).json({ error: "Faltan datos en el pedido (carrito o mesa)" });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Calcular el total asegurándonos de que los nombres de propiedad coincidan con el frontend
        const total = carrito.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

        // Insertar en la tabla 'pedidos' (Asegúrate de haber renombrado la columna a 'mesa' en pgAdmin)
        const pedidoRes = await client.query(
            'INSERT INTO pedidos (mesa, total, estado) VALUES ($1, $2, $3) RETURNING id',
            [mesa, total, 'pendiente']
        );
        
        const pedidoId = pedidoRes.rows[0].id;

        // Insertar cada producto en detalles_pedido
        for (const item of carrito) {
            await client.query(
                'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [pedidoId, item.producto_id, item.cantidad, item.precio_unitario]
            );
        }

        await client.query('COMMIT');
        
        res.status(201).json({ 
            mensaje: 'Pedido recibido con éxito', 
            pedidoId: pedidoId 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error procesando pedido:', err);
        res.status(500).json({ error: "Error interno al guardar el pedido" });
    } finally {
        client.release();
    }
});

// --- RUTA 3: PANEL DE ADMINISTRADOR ---
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
        console.error('Error en panel admin:', err);
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});

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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor de Sistemas-Pedidos activo en puerto ${PORT}`);
});