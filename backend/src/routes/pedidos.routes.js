const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');

router.post('/pedidos', pedidosController.crearPedido);
router.get('/pedidos/:id/estado', pedidosController.rastrearPedido);

module.exports = router;