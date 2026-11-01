// Implementacao das operacoes definidas no WSDL (regras de negocio do Estoque)
const repo = require('../repository/produtoRepository');

const handlers = {
  verificarEstoque({ sku, quantidade }) {
    const p = repo.buscar(sku);
    if (!p) return { disponivel: false, saldo: 0 };
    return { disponivel: p.saldo >= Number(quantidade), saldo: p.saldo };
  },

  baixarEstoque({ sku, quantidade }) {
    const qtd = Number(quantidade);
    const p = repo.buscar(sku);
    if (!p) return { sucesso: false, saldoAtual: 0, mensagem: `SKU ${sku} nao encontrado` };
    if (p.saldo < qtd) return { sucesso: false, saldoAtual: p.saldo, mensagem: 'Saldo insuficiente' };
    const atualizado = repo.atualizarSaldo(sku, p.saldo - qtd);
    return { sucesso: true, saldoAtual: atualizado.saldo, mensagem: 'Baixa realizada' };
  },

  // Operacao de compensacao (desfaz uma baixa)
  reporEstoque({ sku, quantidade }) {
    const p = repo.buscar(sku);
    if (!p) return { sucesso: false, saldoAtual: 0, mensagem: `SKU ${sku} nao encontrado` };
    const atualizado = repo.atualizarSaldo(sku, p.saldo + Number(quantidade));
    return { sucesso: true, saldoAtual: atualizado.saldo, mensagem: 'Reposicao realizada' };
  },
};

// Estrutura exigida pelo node-soap: { Service: { Port: { operacoes } } }
module.exports = { EstoqueService: { EstoquePort: handlers } };
