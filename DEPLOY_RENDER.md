# Deploy da API da Ouvidoria no Render.com

Este guia explica como fazer o deploy da API da Ouvidoria da Polícia Militar no Render.com.

## 📋 Pré-requisitos

- Conta no Render.com
- Repositório Git com o código da API
- Python 3.9+ instalado localmente (para testes)

## 🚀 Configuração do Deploy

### 1. Estrutura do Projeto

Certifique-se de que seu projeto tenha a seguinte estrutura:

```
projetoouvidoria/
├── render.yaml
├── requirements.txt
├── src/
│   └── backend/
│       ├── api/
│       │   └── app.py
│       └── requirements.txt
```

### 2. Configuração do Render

O arquivo `render.yaml` já está configurado com:

- **Nome do serviço**: `ouvidoria-pm-backend`
- **Runtime**: Python 3.9.16
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn src.backend.api.app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
- **Health Check**: `/health`
- **Auto Deploy**: Habilitado

### 3. Variáveis de Ambiente

As seguintes variáveis são configuradas automaticamente:

- `RENDER=true` - Identifica que está rodando no Render
- `FLASK_ENV=production` - Modo de produção
- `FLASK_DEBUG=false` - Debug desabilitado
- `PYTHON_VERSION=3.9.16` - Versão do Python

### 4. Configurações Opcionais

Para funcionalidades avançadas, você pode adicionar estas variáveis no painel do Render:

#### Discord Integration (Opcional)
```
DISCORD_GUILD_ID=seu_guild_id
DISCORD_BOT_TOKEN=seu_bot_token
```

## 🔧 Funcionalidades Implementadas

### Endpoints Principais

#### Denúncias
- `POST /api/denuncias` - Criar nova denúncia
- `GET /api/denuncias` - Listar todas as denúncias
- `GET /api/denuncias/<protocolo>` - Buscar denúncia por protocolo
- `PATCH /api/denuncias/<protocolo>` - Atualizar status
- `DELETE /api/denuncias/<protocolo>` - Deletar denúncia

#### Notícias
- `GET /api/noticias` - Listar todas as notícias
- `POST /api/noticias` - Criar nova notícia
- `DELETE /api/noticias/<id>` - Deletar notícia

#### Finalizadas
- `GET /api/finalizadas` - Listar denúncias finalizadas
- `GET /api/finalizadas/<protocolo>` - Buscar finalizada por protocolo
- `POST /api/finalizadas` - Adicionar denúncia finalizada

#### Sistema
- `GET /` - Página inicial
- `GET /health` - Health check
- `GET /test` - Teste de conectividade

### Banco de Dados

- **Tipo**: SQLite
- **Localização**: `/tmp/ouvidoria.db` (no Render)
- **Índices**: Otimizados para performance
- **Backup**: Automático via logs

### Logs e Monitoramento

- **Logs**: Rotativos em `logs/ouvidoria.log`
- **Health Check**: Endpoint `/health`
- **Timestamps**: Em todas as respostas
- **Error Handling**: Tratamento robusto de erros

## 🚀 Deploy Automático

### Via Git (Recomendado)

1. **Conecte seu repositório**:
   - Vá para o painel do Render
   - Clique em "New Web Service"
   - Conecte seu repositório Git

2. **Configure o serviço**:
   - **Name**: `ouvidoria-pm-backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn src.backend.api.app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`

3. **Configure as variáveis de ambiente**:
   - `RENDER=true`
   - `FLASK_ENV=production`
   - `FLASK_DEBUG=false`

4. **Deploy**:
   - Clique em "Create Web Service"
   - O deploy será automático

### Via render.yaml

Se você já tem o arquivo `render.yaml` configurado:

1. **Instale o CLI do Render** (opcional):
   ```bash
   npm install -g @render/cli
   ```

2. **Deploy via CLI**:
   ```bash
   render deploy
   ```

## 🔍 Monitoramento

### Health Check

O endpoint `/health` verifica:
- Status do servidor
- Conexão com banco de dados
- Timestamp da verificação

### Logs

Acesse os logs no painel do Render:
- **Build Logs**: Durante o deploy
- **Runtime Logs**: Durante a execução

### Métricas

O Render fornece métricas automáticas:
- **CPU Usage**
- **Memory Usage**
- **Request Count**
- **Response Time**

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Build Falha
```
Error: ModuleNotFoundError: No module named 'flask'
```
**Solução**: Verifique se `requirements.txt` está na raiz do projeto.

#### 2. Runtime Error
```
Error: No such file or directory: '/tmp/ouvidoria.db'
```
**Solução**: O banco será criado automaticamente na primeira execução.

#### 3. Health Check Falha
```
Error: Database connection failed
```
**Solução**: Verifique se o banco foi inicializado corretamente.

### Debug Local

Para testar localmente:

```bash
# Instalar dependências
pip install -r requirements.txt

# Executar localmente
python src/backend/api/app.py

# Testar endpoints
curl http://localhost:5000/health
curl http://localhost:5000/api/denuncias
```

## 🔄 Atualizações

### Deploy Automático

O Render faz deploy automático quando:
- Você faz push para a branch principal
- O arquivo `render.yaml` é atualizado

### Deploy Manual

Para forçar um novo deploy:
1. Vá para o painel do serviço no Render
2. Clique em "Manual Deploy"
3. Selecione a branch/commit desejado

## 📊 Performance

### Otimizações Implementadas

- **Gunicorn**: 2 workers para melhor performance
- **SQLite**: Configurações otimizadas (WAL, cache)
- **Índices**: Criados automaticamente
- **CORS**: Configurado para todas as origens
- **Logging**: Rotativo para evitar uso excessivo de disco

### Recomendações

- **Monitor**: Use as métricas do Render
- **Scale**: Aumente workers se necessário
- **Backup**: Configure backup do banco se necessário

## 🔐 Segurança

### Configurações de Segurança

- **CORS**: Configurado para desenvolvimento
- **Error Messages**: Genéricos em produção
- **Logs**: Sem dados sensíveis
- **Database**: Isolado por serviço

### Para Produção

Considere adicionar:
- **Rate Limiting**
- **Authentication**
- **HTTPS Only**
- **Input Validation**

## 📞 Suporte

Para problemas específicos do Render:
- **Documentação**: https://render.com/docs
- **Status**: https://status.render.com
- **Community**: https://community.render.com

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2024  
**Compatível com**: Render.com 