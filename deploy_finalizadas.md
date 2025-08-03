# 🚀 Deploy do Backend de Finalizadas no Render

## 📋 Passos para Deploy

### 1. Criar Repositório Separado
```bash
# Criar novo repositório no GitHub
# Nome: ouvidoria-finalizadas
# Descrição: Backend para denúncias finalizadas da Ouvidoria PM NC
```

### 2. Preparar Arquivos
Os seguintes arquivos já estão configurados:
- ✅ `src/backend/finalizadas/app.py` - Aplicação Flask
- ✅ `src/backend/finalizadas/requirements.txt` - Dependências
- ✅ `src/backend/finalizadas/render.yaml` - Configuração Render
- ✅ `src/backend/finalizadas/runtime.txt` - Versão Python

### 3. Deploy no Render.com

1. **Acesse** [render.com](https://render.com)
2. **Faça login** na sua conta
3. **Clique** em "New +"
4. **Selecione** "Web Service"
5. **Conecte** o repositório GitHub
6. **Configure** o serviço:
   - **Name**: `ouvidoria-finalizadas`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Python Version**: `3.9.16`

### 4. Configurações do Render

#### Variáveis de Ambiente (se necessário):
```
PYTHON_VERSION=3.9.16
```

#### Configurações Avançadas:
- **Auto-Deploy**: ✅ Enabled
- **Branch**: `main`
- **Health Check Path**: `/`

### 5. URLs dos Serviços

Após o deploy, você terá:
- **Backend Principal**: `https://policiamilitarnovacapital.onrender.com`
- **Backend Finalizadas**: `https://ouvidoria-finalizadas.onrender.com`

### 6. Teste da Integração

1. **Acesse** o painel admin
2. **Finalize** uma denúncia
3. **Verifique** se foi movida para o backend de finalizadas
4. **Teste** a API: `https://ouvidoria-finalizadas.onrender.com/api/finalizadas`

## 🔧 Endpoints Disponíveis

### Denúncias Finalizadas
- `GET /api/finalizadas` - Lista todas
- `POST /api/finalizadas` - Adiciona nova
- `GET /api/finalizadas/<protocolo>` - Busca por protocolo
- `PATCH /api/finalizadas/<protocolo>` - Atualiza
- `DELETE /api/finalizadas/<protocolo>` - Remove

### Estatísticas
- `GET /stats` - Estatísticas gerais

### Status
- `GET /` - Status da API

## 📊 Monitoramento

- **Logs**: Disponível no painel do Render
- **Métricas**: Uptime e performance
- **Alertas**: Configuráveis para downtime

## 🔒 Segurança

- **HTTPS**: Automático no Render
- **CORS**: Configurado para permitir frontend
- **Rate Limiting**: Implementado se necessário

---

**Status**: ✅ Pronto para deploy
**URL**: `https://ouvidoria-finalizadas.onrender.com` 