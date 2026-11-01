const router = require('express').Router();
const ctrl = require('../controllers/pedidoController');
router.post('/pedidos', ctrl.criar);
router.get('/pedidos', ctrl.listar);
router.get('/pedidos/:id', ctrl.buscar);
module.exports = router;
