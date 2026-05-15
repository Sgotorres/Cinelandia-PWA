const pool = require('../../db');

const crearPedido = async (req, res) => {
    const { carrito, mesa } = req.body;
    if (!carrito || carrito.length === 0 || !mesa) return res.status(400).json({ error: "Faltan datos" });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const total = carrito.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

        const pedidoRes = await client.query(
            'INSERT INTO pedidos (mesa, total, estado) VALUES ($1, $2, $3) RETURNING id',
            [mesa, total, 'pendiente']
        );
        const pedidoId = pedidoRes.rows[0].id;

        for (const item of carrito) {
            await client.query(
                'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, talla) VALUES ($1, $2, $3, $4, $5)',
                [pedidoId, item.producto_id, item.cantidad, item.precio_unitario, item.talla]
            );
        }
        await client.query('COMMIT');

        // Socket.io inyectado
        const io = req.app.get('io');
        io.emit('nuevo_pedido_recibido', { id: pedidoId, mesa: mesa });

        res.status(201).json({ mensaje: 'Pedido recibido', pedidoId });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: "Error interno" });
    } finally {
        client.release();
    }
};

const rastrearPedido = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT estado FROM pedidos WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Pedido no encontrado" });
        res.json({ estado: result.rows[0].estado });
    } catch (err) {
        res.status(500).json({ error: "Error de telemetría" });
    }
};

module.exports = { crearPedido, rastrearPedido };