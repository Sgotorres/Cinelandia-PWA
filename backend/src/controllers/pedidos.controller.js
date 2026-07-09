const pool = require('../../db');

// Función segura con transacciones (Fase 1)
const crearPedido = async (req, res) => {
    const { carrito, mesa } = req.body;
    
    if (!Array.isArray(carrito) || carrito.length === 0 || !mesa) {
        return res.status(400).json({ error: "Payload inválido" });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        let totalReal = 0;
        
        const pedidoRes = await client.query(
            'INSERT INTO pedidos (mesa, total, estado) VALUES ($1, $2, $3) RETURNING id',
            [mesa, 0, 'pendiente']
        );
        const pedidoId = pedidoRes.rows[0].id;

        const insertDetallesQuery = 'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, talla) VALUES ($1, $2, $3, $4, $5)';
        
        for (const item of carrito) {
            const prodRes = await client.query('SELECT precio, precio_g, precio_f FROM productos WHERE id = $1 AND disponible = true', [item.producto_id]);
            if(prodRes.rowCount === 0) throw new Error(`Producto ID ${item.producto_id} no existe o está agotado`);
            
            const producto = prodRes.rows[0];
            let precioAplicar = 0;
            
            switch(item.talla) {
                case 'Mediana': precioAplicar = producto.precio; break;
                case 'Grande': precioAplicar = producto.precio_g; break;
                case 'Familiar': precioAplicar = producto.precio_f; break;
                default: throw new Error(`Talla inválida: ${item.talla}`);
            }

            totalReal += (precioAplicar * item.cantidad);
            await client.query(insertDetallesQuery, [pedidoId, item.producto_id, item.cantidad, precioAplicar, item.talla]);
        }

        await client.query('UPDATE pedidos SET total = $1 WHERE id = $2', [totalReal, pedidoId]);
        await client.query('COMMIT');

        const io = req.app.get('io');
        io.to('admin-room').emit('nuevo_pedido_recibido', { id: pedidoId, mesa: mesa });

        res.status(201).json({ mensaje: 'Misión recibida', pedidoId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error en transacción:", err);
        res.status(400).json({ error: err.message || "Fallo en integridad del pedido" });
    } finally {
        client.release();
    }
};

// Función para rastrear pedido
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

// NUEVA FUNCIÓN: Agregar productos a un pedido existente
const agregarAPedido = async (req, res) => {
    const { carrito, mesa } = req.body;
    
    if (!Array.isArray(carrito) || carrito.length === 0 || !mesa) {
        return res.status(400).json({ error: "Payload inválido" });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Buscamos el pedido activo de esta mesa (que no esté finalizado)
        const pedidoActivo = await client.query(
            "SELECT id, total FROM pedidos WHERE mesa = $1 AND estado != 'finalizado' LIMIT 1",
            [mesa]
        );

        if (pedidoActivo.rowCount === 0) {
            throw new Error(`No hay un pedido activo en curso para la ${mesa}.`);
        }

        const pedidoId = pedidoActivo.rows[0].id;
        // Postgres devuelve los NUMERIC como string, lo pasamos a número
        let nuevoTotal = parseFloat(pedidoActivo.rows[0].total) || 0; 

        // 2. Insertamos los nuevos detalles a ese pedido
        const insertDetallesQuery = 'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, talla) VALUES ($1, $2, $3, $4, $5)';
        
        for (const item of carrito) {
            const prodRes = await client.query('SELECT precio, precio_g, precio_f FROM productos WHERE id = $1 AND disponible = true', [item.producto_id]);
            if(prodRes.rowCount === 0) throw new Error(`Producto ID ${item.producto_id} no existe o está agotado`);
            
            const producto = prodRes.rows[0];
            let precioAplicar = 0;
            
            switch(item.talla) {
                case 'Mediana': precioAplicar = producto.precio; break;
                case 'Grande': precioAplicar = producto.precio_g; break;
                case 'Familiar': precioAplicar = producto.precio_f; break;
                default: throw new Error(`Talla inválida: ${item.talla}`);
            }

            nuevoTotal += (precioAplicar * item.cantidad);
            await client.query(insertDetallesQuery, [pedidoId, item.producto_id, item.cantidad, precioAplicar, item.talla]);
        }

        // 3. Actualizamos el gran total en la tabla de pedidos
        await client.query('UPDATE pedidos SET total = $1 WHERE id = $2', [nuevoTotal, pedidoId]);
        await client.query('COMMIT');

        // Avisar a la cocina que se modificó este pedido
        const io = req.app.get('io');
        io.to('admin-room').emit('pedido_actualizado', { id: pedidoId, mesa: mesa });

        res.status(200).json({ mensaje: 'Productos añadidos exitosamente', pedidoId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error al agregar a pedido existente:", err);
        res.status(400).json({ error: err.message || "Fallo en integridad del pedido" });
    } finally {
        client.release();
    }
};

// Exportamos las 3 funciones para que las rutas las encuentren
module.exports = { crearPedido, rastrearPedido, agregarAPedido };