const pool = require('../../db');

// Función segura con transacciones
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

        // Query preparado para recibir producto_2_id
        const insertDetallesQuery = 'INSERT INTO detalles_pedido (pedido_id, producto_id, producto_2_id, cantidad, precio_unitario, talla) VALUES ($1, $2, $3, $4, $5, $6)';
        
        for (const item of carrito) {
            let precioAplicar = 0;
            let id1 = null;
            let id2 = null;

            // Verificamos si es una pizza Mitad y Mitad
            if (item.es_mitad && item.ids_mitades && item.ids_mitades.length === 2) {
                id1 = item.ids_mitades[0];
                id2 = item.ids_mitades[1];

                // Consultamos el precio de AMBAS mitades en la base de datos por seguridad
                const res1 = await client.query('SELECT precio, precio_g, precio_f FROM productos WHERE id = $1 AND disponible = true', [id1]);
                const res2 = await client.query('SELECT precio, precio_g, precio_f FROM productos WHERE id = $1 AND disponible = true', [id2]);

                if (res1.rowCount === 0 || res2.rowCount === 0) throw new Error("Una de las mitades no existe o está agotada");

                let pMitad1 = 0, pMitad2 = 0;
                switch(item.talla) {
                    case 'Mediana': pMitad1 = parseFloat(res1.rows[0].precio); pMitad2 = parseFloat(res2.rows[0].precio); break;
                    case 'Grande': pMitad1 = parseFloat(res1.rows[0].precio_g); pMitad2 = parseFloat(res2.rows[0].precio_g); break;
                    case 'Familiar': pMitad1 = parseFloat(res1.rows[0].precio_f); pMitad2 = parseFloat(res2.rows[0].precio_f); break;
                    default: throw new Error(`Talla inválida: ${item.talla}`);
                }
                
                // LÓGICA DE NEGOCIO: Cobramos la mitad más cara
                precioAplicar = Math.max(pMitad1, pMitad2);

            } else {
                // Lógica original para productos normales o pizzas completas
                id1 = item.producto_id;
                
                const prodRes = await client.query('SELECT precio, precio_g, precio_f FROM productos WHERE id = $1 AND disponible = true', [id1]);
                if(prodRes.rowCount === 0) throw new Error(`Producto ID ${id1} no existe o está agotado`);
                
                const producto = prodRes.rows[0];
                switch(item.talla) {
                    case 'Mediana': precioAplicar = parseFloat(producto.precio); break;
                    case 'Grande': precioAplicar = parseFloat(producto.precio_g); break;
                    case 'Familiar': precioAplicar = parseFloat(producto.precio_f); break;
                    default: throw new Error(`Talla inválida: ${item.talla}`);
                }
            }

            totalReal += (precioAplicar * item.cantidad);
            // Insertamos enviando id1 e id2 (id2 será null automáticamente si es una pizza entera)
            await client.query(insertDetallesQuery, [pedidoId, id1, id2, item.cantidad, precioAplicar, item.talla]);
        }

        await client.query('UPDATE pedidos SET total = $1 WHERE id = $2', [totalReal, pedidoId]);
        await client.query('COMMIT');
        await pool.query("UPDATE mesas SET estado = 'esperando' WHERE nombre = $1", [mesa]);
        
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

// Agregar productos a un pedido existente
const agregarAPedido = async (req, res) => {
    const { carrito, mesa } = req.body;
    
    if (!Array.isArray(carrito) || carrito.length === 0 || !mesa) {
        return res.status(400).json({ error: "Payload inválido" });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const pedidoActivo = await client.query(
            "SELECT id, total FROM pedidos WHERE mesa = $1 AND estado != 'finalizado' LIMIT 1",
            [mesa]
        );

        if (pedidoActivo.rowCount === 0) {
            throw new Error(`No hay un pedido activo en curso para la ${mesa}.`);
        }

        const pedidoId = pedidoActivo.rows[0].id;
        let nuevoTotal = parseFloat(pedidoActivo.rows[0].total) || 0;

        // Query preparado para recibir producto_2_id
        const insertDetallesQuery = 'INSERT INTO detalles_pedido (pedido_id, producto_id, producto_2_id, cantidad, precio_unitario, talla) VALUES ($1, $2, $3, $4, $5, $6)';
        
        for (const item of carrito) {
            let precioAplicar = 0;
            let id1 = null;
            let id2 = null;

            if (item.es_mitad && item.ids_mitades && item.ids_mitades.length === 2) {
                id1 = item.ids_mitades[0];
                id2 = item.ids_mitades[1];

                const res1 = await client.query('SELECT precio, precio_g, precio_f FROM productos WHERE id = $1 AND disponible = true', [id1]);
                const res2 = await client.query('SELECT precio, precio_g, precio_f FROM productos WHERE id = $1 AND disponible = true', [id2]);

                if (res1.rowCount === 0 || res2.rowCount === 0) throw new Error("Una de las mitades no existe o está agotada");

                let pMitad1 = 0, pMitad2 = 0;
                switch(item.talla) {
                    case 'Mediana': pMitad1 = parseFloat(res1.rows[0].precio); pMitad2 = parseFloat(res2.rows[0].precio); break;
                    case 'Grande': pMitad1 = parseFloat(res1.rows[0].precio_g); pMitad2 = parseFloat(res2.rows[0].precio_g); break;
                    case 'Familiar': pMitad1 = parseFloat(res1.rows[0].precio_f); pMitad2 = parseFloat(res2.rows[0].precio_f); break;
                    default: throw new Error(`Talla inválida: ${item.talla}`);
                }
                
                precioAplicar = Math.max(pMitad1, pMitad2);

            } else {
                id1 = item.producto_id;
                
                const prodRes = await client.query('SELECT precio, precio_g, precio_f FROM productos WHERE id = $1 AND disponible = true', [id1]);
                if(prodRes.rowCount === 0) throw new Error(`Producto ID ${id1} no existe o está agotado`);
                
                const producto = prodRes.rows[0];
                switch(item.talla) {
                    case 'Mediana': precioAplicar = parseFloat(producto.precio); break;
                    case 'Grande': precioAplicar = parseFloat(producto.precio_g); break;
                    case 'Familiar': precioAplicar = parseFloat(producto.precio_f); break;
                    default: throw new Error(`Talla inválida: ${item.talla}`);
                }
            }

            nuevoTotal += (precioAplicar * item.cantidad);
            await client.query(insertDetallesQuery, [pedidoId, id1, id2, item.cantidad, precioAplicar, item.talla]);
        }

        await client.query('UPDATE pedidos SET total = $1 WHERE id = $2', [nuevoTotal, pedidoId]);
        await client.query('COMMIT');

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
// Obtener lista de mesas
const obtenerMesas = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM mesas ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener mesas:", err);
        res.status(500).json({ error: "Error al obtener mesas" });
    }
};

module.exports = { crearPedido, rastrearPedido, agregarAPedido, obtenerMesas };