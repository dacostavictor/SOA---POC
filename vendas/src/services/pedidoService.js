// Camada de negocio de Vendas
const crypto = require('crypto');
const repo = require('../repository/pedidoRepository');
const mediador = require('../integration/mediadorClient');

function validar({ cliente, itens }) {
  const erros = [];
  if (typeof cliente !== 'string' || !cliente.trim()) erros.push('cliente obrigatorio');
  if (!Array.isArray(itens) || itens.length === 0) erros.push('itens deve ser lista nao vazia');
  else itens.forEach((i, idx) => {
    if (typeof i.sku !== 'string' || !i.sku) erros.push(`itens[${idx}].sku invalido`);
    if (!Number.isInteger(i.quantidade) || i.quantidade <= 0) erros.push(`itens[${idx}].quantidade deve ser inteiro > 0`);
  });
  return erros;
}

async function criarPedido(dados) {
  const erros = validar(dados);
  if (erros.length) return { httpStatus: 400, body: { erros } };

  const pedido = repo.inserir({
    id: crypto.randomUUID(),
    cliente: dados.cliente,
    itens: dados.itens,
    status: 'PENDENTE',
    criadoEm: new Date().toISOString(),
  });

  try {
    const { body } = await mediador.solicitarReserva(
      { pedidoId: pedido.id, itens: pedido.itens },
      pedido.id // correlation id
    );
    if (body.status === 'CONFIRMADO') {
      return { httpStatus: 201, body: repo.atualizar(pedido.id, { status: 'CONFIRMADO', processadoPor: body.processadoPor }) };
    }
    return { httpStatus: 409, body: repo.atualizar(pedido.id, { status: 'REJEITADO', motivo: body.motivo, processadoPor: body.processadoPor }) };
  } catch (e) {
    return { httpStatus: 503, body: repo.atualizar(pedido.id, { status: 'FALHA_INTEGRACAO', motivo: 'Mediador indisponivel' }) };
  }
}

module.exports = { criarPedido, listar: repo.listar, buscar: repo.buscar };
