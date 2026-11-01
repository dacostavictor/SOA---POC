const $ = (s) => document.querySelector(s);
function el(tag, props = {}, ...filhos) {
  const e = Object.assign(document.createElement(tag), props);
  filhos.forEach((f) => e.append(f));
  return e;
}

let anterior = {};
async function carregar() {
  try {
    const lista = await (await fetch('/admin/produtos')).json();
    const tbody = $('#produtos');
    tbody.replaceChildren();
    lista.forEach((p) => {
      const delta = anterior[p.sku] !== undefined ? p.saldo - anterior[p.sku] : 0;
      const nivel = p.saldo === 0 ? ['err', 'Esgotado'] : p.saldo <= 5 ? ['warn', 'Baixo'] : ['ok', 'Normal'];
      tbody.append(el('tr', {},
        el('td', { className: 'mono', textContent: p.sku }),
        el('td', { textContent: p.nome }),
        el('td', { textContent: delta ? `${p.saldo} (${delta > 0 ? '+' : ''}${delta})` : String(p.saldo) }),
        el('td', {}, el('span', { className: `badge ${nivel[0]}`, textContent: nivel[1] }))));
      anterior[p.sku] = p.saldo;
    });
    const total = lista.reduce((s, p) => s + p.saldo, 0);
    const resumo = $('#resumo');
    resumo.replaceChildren(
      el('div', { className: 'card stat' }, 'Produtos', el('b', { textContent: lista.length })),
      el('div', { className: 'card stat' }, 'Unidades em estoque', el('b', { textContent: total })));
    $('#atualizado').textContent = `atualizado ${new Date().toLocaleTimeString('pt-BR')}`;
  } catch (e) {
    $('#atualizado').textContent = 'Estoque fora do ar';
  }
}
carregar();
setInterval(carregar, 2000);
