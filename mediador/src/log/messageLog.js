// Log de mensagens do barramento (observabilidade / governanca)
const MAX = 500;
const entradas = [];

function registrar(correlationId, tipo, operacao, payload) {
  const e = { ts: new Date().toISOString(), correlationId, tipo, operacao, payload };
  entradas.push(e);
  if (entradas.length > MAX) entradas.shift();
  console.log(`[mediador] ${e.ts} ${correlationId} ${tipo} ${operacao} ${JSON.stringify(payload)}`);
}
module.exports = { registrar, listar: () => entradas };
