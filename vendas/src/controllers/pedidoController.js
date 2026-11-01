// Camada de apresentacao: so conhece o service, nunca o repository
const service = require('../services/pedidoService');

module.exports = {
  async criar(req, res) {
    const { httpStatus, body } = await service.criarPedido(req.body || {});
    res.status(httpStatus).json(body);
  },
  listar: (req, res) => res.json(service.listar()),
  buscar(req, res) {
    const p = service.buscar(req.params.id);
    return p ? res.json(p) : res.status(404).json({ erro: 'Pedido nao encontrado' });
  },
};
