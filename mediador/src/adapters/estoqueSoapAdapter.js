// Adaptador: traduz o modelo canonico (JSON) para chamadas SOAP do Estoque.
// Trocar o Estoque por outra implementacao = trocar so este arquivo / ESTOQUE_URL.
const soap = require('soap');
const ESTOQUE_URL = process.env.ESTOQUE_URL || 'http://localhost:4002/estoque';

let clientPromise = null;
function getClient() {
  if (!clientPromise) {
    // Descoberta do contrato em tempo de execucao (WSDL publicado pelo proprio servico)
    clientPromise = soap.createClientAsync(`${ESTOQUE_URL}?wsdl`, { endpoint: ESTOQUE_URL }).catch((e) => {
      clientPromise = null; // permite nova tentativa
      throw e;
    });
  }
  return clientPromise;
}

async function chamar(operacao, args) {
  const client = await getClient();
  const [resultado] = await client[`${operacao}Async`](args);
  return resultado;
}

module.exports = {
  verificar: (sku, quantidade) => chamar('verificarEstoque', { sku, quantidade }),
  baixar: (sku, quantidade, referencia) => chamar('baixarEstoque', { sku, quantidade, referencia }),
  repor: (sku, quantidade, referencia) => chamar('reporEstoque', { sku, quantidade, referencia }),
};
