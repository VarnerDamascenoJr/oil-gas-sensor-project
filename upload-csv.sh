#!/bin/bash

# Verifica se o caminho do arquivo foi fornecido
if [ "$#" -ne 1 ]; then
  echo "Uso: $0 ./file-test.csv"
  exit 1
fi

FILE_PATH=$1

# Verifica se o arquivo existe
if [ ! -f "$FILE_PATH" ]; then
  echo "Arquivo não encontrado: $FILE_PATH"
  exit 1
fi

# Envia o arquivo CSV para o endpoint
curl -X POST -F "file=@$FILE_PATH" http://localhost:8080/data/csv