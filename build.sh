#!/bin/bash

# Script de build para Netlify
echo "Iniciando build..."

# Instalar dependências Python
pip install -r requirements.txt

# Criar diretório para funções se não existir
mkdir -p .netlify/functions

# Copiar arquivo da API para funções
cp src/backend/api/app.py .netlify/functions/

# Verificar se os arquivos do frontend existem
echo "Verificando arquivos do frontend..."
ls -la src/frontend/
ls -la src/frontend/assets/

echo "Build concluído!" 