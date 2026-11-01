const express = require('express');
const soap = require('soap');
const fs = require('fs');
const path = require('path');
const services = require('./soap/estoqueService');
const repo = require('./repository/produtoRepository');

const PORT = process.env.PORT || 4002;
const wsdl = fs.readFileSync(path.join(__dirname, '../wsdl/estoque.wsdl'), 'utf8');

const app = express();
app.get('/health', (req, res) => res.json({ status: 'UP', servico: 'estoque' }));
// Endpoint auxiliar SOMENTE para visualizar o saldo durante a demo (nao faz parte do contrato SOAP)
app.get('/admin/produtos', (req, res) => res.json(repo.listar()));

app.listen(PORT, () => {
  soap.listen(app, '/estoque', services, wsdl);
  console.log(`[estoque] SOAP em http://localhost:${PORT}/estoque (WSDL: ?wsdl)`);
});
