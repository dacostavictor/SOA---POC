// Camada de acesso a dados do Estoque (banco proprio: arquivo JSON em DATA_DIR)
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const FILE = path.join(DATA_DIR, 'estoque.json');

const SEED = [
  { sku: 'SKU-001', nome: 'Teclado Mecanico', saldo: 50 },
  { sku: 'SKU-002', nome: 'Mouse Gamer', saldo: 30 },
  { sku: 'SKU-003', nome: 'Monitor 27"', saldo: 5 },
];

function carregar() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify(SEED, null, 2));
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}
const salvar = (lista) => fs.writeFileSync(FILE, JSON.stringify(lista, null, 2));

module.exports = {
  listar: () => carregar(),
  buscar: (sku) => carregar().find((p) => p.sku === sku),
  atualizarSaldo(sku, novoSaldo) {
    const lista = carregar();
    const p = lista.find((x) => x.sku === sku);
    p.saldo = novoSaldo;
    salvar(lista);
    return p;
  },
};
