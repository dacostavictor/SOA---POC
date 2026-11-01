// Front-end do Vendas: fala SOMENTE com a API do proprio Vendas (mesma origem).
// O catalogo abaixo e do dominio de Vendas (nao consulta o Estoque).
const CATALOGO = [
  { sku: 'SKU-001', nome: 'Teclado Mecânico' },
  { sku: 'SKU-002', nome: 'Mouse Gamer' },
  { sku: 'SKU-003', nome: 'Monitor 27"' },
];
const STATUS = { CONFIRMADO: 'ok', REJEITADO: 'warn', FALHA_INTEGRACAO: 'err', PENDENTE: 'info' };

const $ = (s) => document.querySelector(s);
function el(tag, props = {}, ...filhos) {
  const e = Object.assign(document.createElement(tag), props);
  filhos.forEach((f) => e.append(f));
  return e;
}

const itensEl = $('#itens');
function addItem() {
  const sel = el('select');
  CATALOGO.forEach((p) => sel.append(el('option', { value: p.sku, textContent: `${p.sku} — ${p.nome}` })));
  const qtd = el('input', { type: 'number', min: 1, value: 1, required: true });
  const row = el('div', { className: 'item' }, sel, qtd,
    el('button', { type: 'button', className: 'ghost', textContent: '✕', title: 'Remover',
      onclick: () => { if (itensEl.children.length > 1) row.remove(); } }));
  itensEl.append(row);
}

function mostrar(texto, tipo) {
  const r = $('#resultado');
  r.hidden = false;
  r.className = `msg ${tipo}`;
  r.textContent = texto;
}

$('#form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const itens = [...itensEl.children].map((row) => ({
    sku: row.querySelector('select').value,
    quantidade: Number(row.querySelector('input').value),
  }));
  const btn = $('#enviar');
  btn.disabled = true;
  try {
    const resp = await fetch('/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cliente: $('#cliente').value.trim(), itens }),
    });
    const p = await resp.json();
    if (resp.status === 201) mostrar(`✔ Pedido confirmado (processado por ${p.processadoPor}).`, 'ok');
    else if (resp.status === 409) mostrar(`Pedido rejeitado: ${p.motivo}.`, 'warn');
    else if (resp.status === 503) mostrar('Mediador indisponível — pedido registrado como FALHA_INTEGRACAO.', 'err');
    else mostrar(`Requisição inválida: ${(p.erros || [p.erro]).join('; ')}`, 'err');
  } catch (e) {
    mostrar(`Não foi possível falar com o Vendas: ${e.message}`, 'err');
  } finally {
    btn.disabled = false;
    carregar();
  }
});

async function carregar() {
  try {
    const lista = await (await fetch('/pedidos')).json();
    const tbody = $('#pedidos');
    tbody.replaceChildren();
    [...lista].reverse().forEach((p) => {
      tbody.append(el('tr', {},
        el('td', { textContent: new Date(p.criadoEm).toLocaleString('pt-BR') }),
        el('td', { textContent: p.cliente }),
        el('td', { textContent: p.itens.map((i) => `${i.quantidade}× ${i.sku}`).join(', ') }),
        el('td', {}, el('span', { className: `badge ${STATUS[p.status] || 'info'}`, textContent: p.status })),
        el('td', { className: 'mono', textContent: p.processadoPor || '—' }),
        el('td', { textContent: p.motivo || '' })));
    });
    $('#vazio').hidden = lista.length > 0;
    $('#atualizado').textContent = `atualizado ${new Date().toLocaleTimeString('pt-BR')}`;
  } catch (e) {
    $('#atualizado').textContent = 'Vendas fora do ar';
  }
}

$('#add').onclick = addItem;
$('#refresh').onclick = carregar;
addItem();
carregar();
setInterval(carregar, 5000);
