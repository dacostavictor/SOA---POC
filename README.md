# PoC SOA - Vendas + Estoque com Mediador (mini-ESB)

Tres servicos independentes, cada um com seu proprio "banco" (arquivo JSON em volume Docker proprio).

| Servico | Porta | Contrato | Papel |
|---|---|---|---|
| vendas | 4001 | REST/JSON (`vendas/openapi.yaml`) | Cria pedidos. Conhece **apenas** o mediador |
| mediador-1 / mediador-2 | 3000 / 3001 | REST/JSON canonico (`mediador/openapi.yaml`) | ESB: valida, roteia, transforma REST->SOAP, orquestra e registra logs |
| estoque | 4002 | SOAP/WSDL (`estoque/wsdl/estoque.wsdl`) | Sistema "legado": verificarEstoque, baixarEstoque, reporEstoque |

Fluxo: `Cliente -> Vendas (REST) -> Mediador (modelo canonico) -> Estoque (SOAP)`

## Executar com Docker (recomendado)
```bash
docker compose up --build
bash scripts/cenarios.sh
```

## Executar sem Docker (3 terminais)
```bash
cd estoque  && npm install && npm start
cd mediador && npm install && npm start
cd vendas   && npm install && npm start
```

## Cenarios da PoC
1. Caminho feliz: pedido confirmado, saldo baixado.
2. Sem estoque: pedido REJEITADO (HTTP 409), saldo intacto.
3. Ponto unico de falha: `docker compose stop mediador-1` (failover para mediador-2);
   depois `docker compose stop mediador-2` (Vendas devolve 503 / FALHA_INTEGRACAO).
4. Acoplamento frouxo: o Estoque pode ser substituido alterando apenas o adaptador
   (`mediador/src/adapters/estoqueSoapAdapter.js`) / `ESTOQUE_URL`; Vendas nao muda.

## Endpoints uteis
- `GET http://localhost:4002/estoque?wsdl` (contrato SOAP)
- `GET http://localhost:4002/admin/produtos` (saldo - apenas auxiliar de demo)
- `GET http://localhost:3000/logs` (log de mensagens do barramento)
- `GET /health` em todos os servicos

## Mapa para o relatorio (diagramas)
- Componentes: Vendas (routes > controllers > services > repository + integration/mediadorClient),
  Mediador (server > validators > orchestrator > adapters/estoqueSoapAdapter + log),
  Estoque (server > soap/estoqueService > repository).
- Sequencia: ver orchestrator (verificar -> baixar -> compensar com repor em caso de falha).
