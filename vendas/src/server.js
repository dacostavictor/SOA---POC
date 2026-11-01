const express = require('express');
const routes = require('./routes/pedidoRoutes');
const PORT = process.env.PORT || 4001;

const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'UP', servico: 'vendas' }));
app.use('/', routes);
app.use((err, req, res, next) => res.status(400).json({ erro: 'Requisicao invalida', detalhe: err.message }));

app.listen(PORT, () => console.log(`[vendas] REST em http://localhost:${PORT}`));
