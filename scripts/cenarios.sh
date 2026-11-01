#!/usr/bin/env bash
# Roda os cenarios da PoC (requer a stack no ar: docker compose up --build)
V=${VENDAS_URL:-http://localhost:4001}
E=${ESTOQUE_URL:-http://localhost:4002}
h() { echo; echo "=== $1 ==="; }

h "Saldo inicial do Estoque"; curl -s $E/admin/produtos; echo

h "Cenario 1 - Caminho feliz (2x SKU-001)"
curl -s -X POST $V/pedidos -H 'Content-Type: application/json' \
  -d '{"cliente":"Maria","itens":[{"sku":"SKU-001","quantidade":2}]}'; echo

h "Cenario 2 - Sem estoque (10x SKU-003, saldo 5)"
curl -s -X POST $V/pedidos -H 'Content-Type: application/json' \
  -d '{"cliente":"Joao","itens":[{"sku":"SKU-003","quantidade":10}]}'; echo

h "Saldo apos os cenarios"; curl -s $E/admin/produtos; echo

echo
echo "Cenario 3 (SPOF):  docker compose stop mediador-1   e repita o cenario 1 (failover p/ mediador-2)"
echo "                   docker compose stop mediador-2   e repita (Vendas responde 503 FALHA_INTEGRACAO)"
echo "Cenario 4 (acoplamento frouxo): troque a implementacao do Estoque mudando apenas ESTOQUE_URL/adaptador do mediador; Vendas nao muda."
echo "Logs do barramento: curl http://localhost:3000/logs"
