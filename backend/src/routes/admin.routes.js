const express = require('express');
const router = express.Router();
const pool = require('../../db'); // Importamos la DB
const verificarAdmin = require('../middlewares/auth.middleware'); // Importamos el middleware de la Fase 2
const jwt = require('jsonwebtoken');

// 1. RUTA DE LOGIN (Pública: para que el admin pueda entrar)
router.post('/admin/login', (req, res) => {
    const { password } = req.body;
    
    // Por ahora validamos así, en un futuro usaremos contraseñas encriptadas en la BD
    if (password === (process.env.ADMIN_PASSWORD || 'cinelandia2026')) {
        const token = jwt.sign({ rol: 'admin' }, process.env.JWT_SECRET || 'supersecreto123', { expiresIn: '8h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Credenciales inválidas" });
    }
});

// 2. RUTAS PROTEGIDAS (Solo accesibles con el Token JWT)
router.get('/admin/pedidos', verificarAdmin, async (req, res) => {
    try {
        const query = `
            SELECT p.id, p.mesa, p.total, p.estado, p.fecha,
                   json_agg(json_build_object('nombre', pr.nombre, 'cantidad', dp.cantidad)) as items
            FROM pedidos p JOIN detalles_pedido dp ON p.id = dp.pedido_id JOIN productos pr ON dp.producto_id = pr.id
            WHERE p.estado != 'finalizado' GROUP BY p.id ORDER BY p.fecha DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: "Error al obtener pedidos" }); }
});

router.get('/admin/stats-hoy', verificarAdmin, async (req, res) => {
    try {
        const query = `
            SELECT COUNT(*) as total_pedidos, COALESCE(SUM(total), 0) as ingresos_totales,
                (SELECT pr.nombre FROM detalles_pedido dp JOIN productos pr ON dp.producto_id = pr.id JOIN pedidos p2 ON dp.pedido_id = p2.id
                 WHERE p2.fecha::date = CURRENT_DATE GROUP BY pr.nombre ORDER BY SUM(dp.cantidad) DESC LIMIT 1) as top_producto
            FROM pedidos WHERE fecha::date = CURRENT_DATE;
        `;
        const result = await pool.query(query);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: "Error en estadísticas" }); }
});

router.patch('/pedidos/:id', verificarAdmin, async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        await pool.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, id]);
        res.json({ mensaje: 'Estado actualizado' });
    } catch (err) { res.status(500).json({ error: 'Error al actualizar' }); }
});

// 3. ACTUALIZAR ESTADO DE LA TIENDA EN POSTGRESQL
router.post('/api/admin/estado', verificarAdmin, async (req, res) => {
    const { abierto } = req.body;
    
    if (typeof abierto !== 'boolean') {
        return res.status(400).json({ exito: false, error: 'Formato inválido. Debe ser true o false.' });
    }

    try {
        // Actualizamos el JSONB en la base de datos
        await pool.query(
            "UPDATE configuracion_sistema SET valor = $1 WHERE clave = 'estado_tienda'",
            [JSON.stringify({ abierta: abierto })]
        );

        console.log(`[SISTEMA DB] El administrador ha ${abierto ? 'ABIERTO' : 'CERRADO'} Cinelandia.`);
        
        // Notificamos a los clientes en tiempo real
        const io = req.app.get('io');
        io.emit('cambio_estado_tienda', { abierto });
        
        res.json({ exito: true, estadoActual: abierto });
    } catch (err) {
        console.error("Error guardando el estado en DB:", err);
        res.status(500).json({ error: "Error al cambiar el estado de la tienda" });
    }
});

module.exports = router;