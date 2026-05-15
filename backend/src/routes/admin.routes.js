const express = require('express');
const router = express.Router();
const pool = require('../../db');
const estadoTienda = require('../middlewares/estadoTienda');

router.get('/admin/pedidos', async (req, res) => {
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

router.get('/admin/stats-hoy', async (req, res) => {
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

router.patch('/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        await pool.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, id]);
        res.json({ mensaje: 'Estado actualizado' });
    } catch (err) { res.status(500).json({ error: 'Error al actualizar' }); }
});

router.post('/api/admin/estado', (req, res) => {
    const { abierto } = req.body;
    if (typeof abierto === 'boolean') {
        estadoTienda.setEstado(abierto);
        console.log(`[SISTEMA] El administrador ha ${abierto ? 'ABIERTO' : 'CERRADO'} Cinelandia.`);
        const io = req.app.get('io');
        io.emit('cambio_estado_tienda', { abierto });
        res.json({ exito: true, estadoActual: abierto });
    } else {
        res.status(400).json({ exito: false, error: 'Formato inválido' });
    }
});

module.exports = router;