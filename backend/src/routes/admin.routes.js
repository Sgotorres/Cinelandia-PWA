const express = require('express');
const router = express.Router();
const pool = require('../../db'); // Importamos la DB
const verificarAdmin = require('../middlewares/auth.middleware');
const jwt = require('jsonwebtoken');

// 1. RUTA DE LOGIN
router.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === (process.env.ADMIN_PASSWORD || 'cinelandia2026')) {
        const token = jwt.sign({ rol: 'admin' }, process.env.JWT_SECRET || 'supersecreto123', { expiresIn: '8h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Credenciales inválidas" });
    }
});

// 2. OBTENER PEDIDOS (CORREGIDO PARA MITAD Y MITAD Y TALLAS)
router.get('/admin/pedidos', verificarAdmin, async (req, res) => {
    try {
        const query = `
            SELECT p.id, p.mesa, p.total, p.estado, p.fecha,
                   json_agg(
                       json_build_object(
                           'nombre', 
                           CASE 
                               WHEN dp.producto_2_id IS NOT NULL THEN '1/2 ' || pr.nombre || ' y 1/2 ' || pr2.nombre
                               ELSE pr.nombre 
                           END, 
                           'cantidad', dp.cantidad,
                           'talla', dp.talla
                       )
                   ) as items
            FROM pedidos p 
            JOIN detalles_pedido dp ON p.id = dp.pedido_id 
            JOIN productos pr ON dp.producto_id = pr.id
            LEFT JOIN productos pr2 ON dp.producto_2_id = pr2.id
            WHERE p.estado != 'finalizado' 
            GROUP BY p.id 
            ORDER BY p.fecha DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) { 
        console.error("Error al obtener pedidos:", err);
        res.status(500).json({ error: "Error al obtener pedidos" }); 
    }
});

// ESTADÍSTICAS
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

// 3. ACTUALIZAR ESTADO DEL PEDIDO (EL PATCH CORREGIDO)
router.patch('/pedidos/:id', verificarAdmin, async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    
    try {
        await pool.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, id]);
        const resultMesa = await pool.query('SELECT mesa FROM pedidos WHERE id = $1', [id]);
        
        if (resultMesa.rows.length > 0) {
            const nombreMesa = resultMesa.rows[0].mesa; // "Mesa 3"
            
            // Extracción segura del número usando Regex (Si falla, devuelve null en vez de NaN)
            const match = nombreMesa.match(/\d+/);
            const idMesa = match ? parseInt(match[0]) : null;

            const io = req.app.get('io');
            
            // Emitimos la sincronización
            io.emit('sincronizar_mesa', { 
                id: idMesa, 
                estado: estado 
            });
        }
        res.json({ mensaje: 'Estado actualizado' });
    } catch (err) { 
        // AHORA SÍ VEREMOS EL ERROR EN LA TERMINAL SI ALGO FALLA
        console.error(`❌ Error crítico en PATCH /pedidos/${req.params.id}:`, err);
        res.status(500).json({ error: 'Error al actualizar el estado' }); 
    }
});

// 4. ACTUALIZAR ESTADO DE LA TIENDA
router.post('/api/admin/estado', verificarAdmin, async (req, res) => {
    const { abierto } = req.body;
    if (typeof abierto !== 'boolean') return res.status(400).json({ exito: false, error: 'Formato inválido.' });

    try {
        await pool.query("UPDATE configuracion_sistema SET valor = $1 WHERE clave = 'estado_tienda'", [JSON.stringify({ abierta: abierto })]);
        const io = req.app.get('io');
        io.emit('cambio_estado_tienda', { abierto });
        res.json({ exito: true, estadoActual: abierto });
    } catch (err) {
        res.status(500).json({ error: "Error al cambiar el estado de la tienda" });
    }
});

module.exports = router;