// Orquestracao do processo "reservar estoque do pedido":
// 1) verifica todos os itens  2) baixa um a um  3) compensa (repoe) se alguma baixa falhar
const estoque = require('../adapters/estoqueSoapAdapter');
const log = require('../log/messageLog');

async function processarPedido(msg, correlationId, instancia) {
  const base = { pedidoId: msg.pedidoId, processadoPor: instancia, correlationId };

  // 1) Verificacao
  const faltantes = [];
  for (const item of msg.itens) {
    const r = await estoque.verificar(item.sku, item.quantidade);
    log.registrar(correlationId, 'SOAP', 'verificarEstoque', { item, resposta: r });
    if (!r.disponivel) faltantes.push({ sku: item.sku, solicitado: item.quantidade, saldo: r.saldo });
  }
  if (faltantes.length) {
    return { ...base, status: 'REJEITADO', motivo: 'Estoque insuficiente', detalhes: faltantes };
  }

  // 2) Baixa (com compensacao)
  const baixados = [];
  for (const item of msg.itens) {
    const r = await estoque.baixar(item.sku, item.quantidade, msg.pedidoId);
    log.registrar(correlationId, 'SOAP', 'baixarEstoque', { item, resposta: r });
    if (!r.sucesso) {
      for (const b of baixados) {
        const c = await estoque.repor(b.sku, b.quantidade, msg.pedidoId);
        log.registrar(correlationId, 'SOAP', 'reporEstoque(compensacao)', { item: b, resposta: c });
      }
      return { ...base, status: 'REJEITADO', motivo: r.mensagem };
    }
    baixados.push(item);
  }
  return { ...base, status: 'CONFIRMADO', itens: msg.itens };
}

module.exports = { processarPedido };
