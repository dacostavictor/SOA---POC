// Validacao do modelo canonico (contrato do barramento)
module.exports = function validarPedidoCanonico(msg) {
  const erros = [];
  if (!msg || typeof msg !== 'object') return ['corpo ausente'];
  if (typeof msg.pedidoId !== 'string' || !msg.pedidoId) erros.push('pedidoId obrigatorio');
  if (!Array.isArray(msg.itens) || msg.itens.length === 0) erros.push('itens deve ser lista nao vazia');
  else msg.itens.forEach((i, idx) => {
    if (typeof i.sku !== 'string' || !i.sku) erros.push(`itens[${idx}].sku invalido`);
    if (!Number.isInteger(i.quantidade) || i.quantidade <= 0) erros.push(`itens[${idx}].quantidade deve ser inteiro > 0`);
  });
  return erros;
};
