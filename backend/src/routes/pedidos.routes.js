const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');

router.post('/pedidos', pedidosController.crearPedido);
router.get('/pedidos/:id/estado', pedidosController.rastrearPedido);
router.post('/pedidos/agregar', pedidosController.agregarAPedido);
router.get('/mesas', pedidosController.obtenerMesas);

module.exports = router;