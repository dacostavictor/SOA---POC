const $ = (s) => document.querySelector(s);
function el(tag, props = {}, ...filhos) {
  const e = Object.assign(document.createElement(tag), props);
  filhos.forEach((f) => e.append(f));
  return e;
}
const TIPO = { REST: 'info', SOAP: 'ok', ERRO: 'err' };

async function carregar() {
  try {
    const [health, logs] = await Promise.all([
      fetch('/health').then((r) => r.json()),
      fetch('/logs').then((r) => r.json()),
    ]);
    $('#instancia').textContent = health.instancia;
    $('#status').textContent = health.status;
    $('#total').textContent = logs.length;
    $('#soap').textContent = logs.filter((l) => l.tipo === 'SOAP').length;
    $('#erros').textContent = logs.filter((l) => l.tipo === 'ERRO').length;

    const f = $('#filtro').value.trim().toLowerCase();
    const filtrados = logs.filter((l) => !f || l.correlationId.toLowerCase().includes(f) || l.operacao.toLowerCase().includes(f));
    const tbody = $('#logs');
    tbody.replaceChildren();
    [...filtrados].reverse().slice(0, 100).forEach((l) => {
      tbody.append(el('tr', {},
        el('td', { textContent: new Date(l.ts).toLocaleTimeString('pt-BR') }),
        el('td', { className: 'mono', textContent: l.correlationId.slice(0, 8), title: l.correlationId }),
        el('td', {}, el('span', { className: `badge ${TIPO[l.tipo] || 'info'}`, textContent: l.tipo })),
        el('td', { textContent: l.operacao }),
        el('td', {}, el('details', {}, el('summary', { textContent: 'ver' }),
          el('pre', { textContent: JSON.stringify(l.payload, null, 2) })))));
    });
    $('#atualizado').textContent = `atualizado ${new Date().toLocaleTimeString('pt-BR')}`;
  } catch (e) {
    $('#status').textContent = 'DOWN';
    $('#atualizado').textContent = 'mediador fora do ar';
  }
}
$('#filtro').addEventListener('input', carregar);
carregar();
setInterval(carregar, 2000);
