# Deploy no Render - Backend da Ouvidoria PM

## Passos para Deploy

### 1. Preparação do Repositório
- ✅ `requirements.txt` - Dependências Python
- ✅ `render.yaml` - Configuração do Render
- ✅ `backend/app.py` - Aplicação Flask configurada
- ✅ `.gitignore` - Arquivos ignorados

### 2. Deploy no Render

1. **Acesse o Render**: https://render.com
2. **Faça login** e clique em "New +"
3. **Selecione "Web Service"**
4. **Conecte seu repositório GitHub**
5. **Configure o serviço**:
   - **Name**: `ouvidoria-pm-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn backend.app:app --bind 0.0.0.0:$PORT`

### 3. Configurações Importantes

#### Variáveis de Ambiente (se necessário):
- `PYTHON_VERSION`: `3.9.16`
- `PORT`: Automático (Render define)

#### Banco de Dados:
- O SQLite será criado automaticamente em `/tmp/ouvidoria.db`
- Os dados são persistentes durante o ciclo de vida do serviço

### 4. URLs Configuradas

Após o deploy, o backend estará disponível em:
- **URL Principal**: `https://policiamilitarnovacapital.onrender.com`
- **API Endpoints**:
  - `GET /` - Status da API
  - `POST /api/denuncias` - Criar denúncia
  - `GET /api/denuncias` - Listar denúncias
  - `PATCH /api/denuncias/<protocolo>` - Atualizar status

### 5. Teste do Deploy

Após o deploy, teste os endpoints:

```bash
# Teste de status
curl https://policiamilitarnovacapital.onrender.com/

# Teste de criação de denúncia
curl -X POST https://policiamilitarnovacapital.onrender.com/api/denuncias \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","rg":"123456","tipo":"1","descricao":"Teste","youtube":""}'
```

### 6. Configuração do Frontend

Os arquivos JavaScript já estão configurados para usar:
- `https://policiamilitarnovacapital.onrender.com` (produção)
- `http://localhost:5000` (desenvolvimento local)

### 7. Monitoramento

- **Logs**: Disponível no painel do Render
- **Status**: Verificar no dashboard do Render
- **Métricas**: Uptime e performance no painel

### 8. Troubleshooting

**Problema**: Serviço não inicia
- Verificar logs no Render
- Confirmar se `requirements.txt` está correto
- Verificar se `gunicorn` está instalado

**Problema**: CORS errors
- Verificar se `Flask-CORS` está instalado
- Confirmar configuração CORS no `app.py`

**Problema**: Banco de dados não persiste
- O SQLite no Render é temporário
- Considerar migrar para PostgreSQL se necessário

**Problema**: Frontend não conecta ao Render
- Verificar se a URL está correta
- Testar com `test-render.html`
- Verificar logs do navegador (F12)
- Confirmar se o serviço está "Live" no Render

**Problema**: Painel admin não carrega denúncias
- Abrir console do navegador (F12)
- Verificar logs de erro
- Testar URLs individualmente
- Verificar se o backend está respondendo

### 9. Teste de Conectividade

Use o arquivo `test-render.html` para verificar:
1. Se o Render está online
2. Se as URLs estão corretas
3. Se há problemas de CORS
4. Se a API está respondendo

### 10. Atualizações

Para atualizar o deploy:
1. Faça commit das mudanças no GitHub
2. O Render fará deploy automático
3. Verifique os logs para confirmar sucesso

### 11. Segurança

- ✅ CORS configurado para aceitar requisições
- ✅ Headers de segurança configurados
- ⚠️ Considerar adicionar autenticação se necessário 