#!/bin/bash

# Definindo variáveis
INFLUXDB_URL="http://localhost:8086"
DATABASE="k6"
TIME_RANGE="1h"

# Consultas
QUERY_MEAN="SELECT MEAN(\"value\") FROM \"http_req_duration\" WHERE time > now() - $TIME_RANGE"
QUERY_P95="SELECT P95(\"value\") FROM \"http_req_duration\" WHERE time > now() - $TIME_RANGE"
QUERY_COUNT="SELECT COUNT(\"value\") FROM \"http_req_duration\" WHERE time > now() - $TIME_RANGE"

# Função para executar consultas
execute_query() {
  local query=$1
  curl -G "$INFLUXDB_URL/query" --data-urlencode "db=$DATABASE" --data-urlencode "q=$query"
}

# Executando consultas e formatando resultados
echo "Relatório de Desempenho - Última $TIME_RANGE"
echo "-----------------------------------------"

echo "Média dos tempos de resposta:"
execute_query "$QUERY_MEAN"

echo
echo "Percentil 95 dos tempos de resposta:"
execute_query "$QUERY_P95"

echo
echo "Número total de requisições:"
execute_query "$QUERY_COUNT"

echo "-----------------------------------------"