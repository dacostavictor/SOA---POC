const express = require('express');
const crypto = require('crypto');
const validar = require('./validators/pedidoCanonico');
const { processarPedido } = require('./orchestrator/pedidoOrchestrator');
const log = require('./log/messageLog');

const PORT = process.env.PORT || 3000;
const INSTANCIA = process.env.INSTANCE_ID || 'mediador-local';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'UP', servico: 'mediador', instancia: INSTANCIA }));
app.get('/logs', (req, res) => res.json(log.listar()));

app.post('/api/v1/pedidos', async (req, res) => {
  const correlationId = req.header('x-correlation-id') || crypto.randomUUID();
  res.set('x-processado-por', INSTANCIA);
  log.registrar(correlationId, 'REST', 'POST /api/v1/pedidos (entrada)', req.body);

  const erros = validar(req.body);
  if (erros.length) return res.status(400).json({ status: 'INVALIDO', erros, correlationId });

  try {
    const resposta = await processarPedido(req.body, correlationId, INSTANCIA);
    log.registrar(correlationId, 'REST', 'resposta canonica', resposta);
    res.status(resposta.status === 'CONFIRMADO' ? 200 : 409).json(resposta);
  } catch (e) {
    log.registrar(correlationId, 'ERRO', 'integracao com Estoque', { mensagem: e.message });
    res.status(502).json({ status: 'ERRO', motivo: 'Servico de estoque indisponivel', correlationId, processadoPor: INSTANCIA });
  }
});

app.listen(PORT, () => console.log(`[${INSTANCIA}] ESB em http://localhost:${PORT}`));
