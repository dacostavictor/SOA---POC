// Camada de acesso a dados de Vendas (banco proprio: arquivo JSON em DATA_DIR)
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const FILE = path.join(DATA_DIR, 'pedidos.json');

function carregar() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}
const gravar = (lista) => fs.writeFileSync(FILE, JSON.stringify(lista, null, 2));

module.exports = {
  listar: () => carregar(),
  buscar: (id) => carregar().find((p) => p.id === id),
  inserir(pedido) {
    const lista = carregar();
    lista.push(pedido);
    gravar(lista);
    return pedido;
  },
  atualizar(id, campos) {
    const lista = carregar();
    const p = lista.find((x) => x.id === id);
    Object.assign(p, campos);
    gravar(lista);
    return p;
  },
};
