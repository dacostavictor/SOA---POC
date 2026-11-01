// Unico ponto de saida de Vendas: conversa SOMENTE com o mediador (nunca com o Estoque).
// Mitigacao do ponto unico de falha: lista de mediadores (failover) + retry com backoff.
const URLS = (process.env.MEDIADOR_URLS || 'http://localhost:3000').split(',').map((u) => u.trim());
const TENTATIVAS = Number(process.env.MEDIADOR_TENTATIVAS || 3);
const TIMEOUT_MS = Number(process.env.MEDIADOR_TIMEOUT_MS || 5000);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function solicitarReserva(pedidoCanonico, correlationId) {
  let ultimoErro;
  for (let t = 1; t <= TENTATIVAS; t++) {
    for (const base of URLS) {
      try {
        const resp = await fetch(`${base}/api/v1/pedidos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
          body: JSON.stringify(pedidoCanonico),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        const body = await resp.json();
        if (resp.status < 500) return { httpStatus: resp.status, body };
        ultimoErro = new Error(`Mediador ${base} respondeu ${resp.status}`);
      } catch (e) {
        ultimoErro = e;
        console.warn(`[vendas] mediador ${base} indisponivel (tentativa ${t}): ${e.message}`);
      }
    }
    await espera(300 * t);
  }
  throw ultimoErro;
}

module.exports = { solicitarReserva };
