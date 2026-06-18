const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');

router.get('/menu', menuController.obtenerMenu);
router.patch('/productos/:id', menuController.actualizarProducto);

module.exports = router;