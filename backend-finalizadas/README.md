# 🚔 Backend de Denúncias Finalizadas - Render.com

Sistema separado para armazenar e gerenciar denúncias que foram finalizadas pela equipe da Ouvidoria.

## 📋 Funcionalidades

- **Armazenamento separado** de denúncias finalizadas
- **API REST completa** para gerenciamento
- **Estatísticas** de denúncias finalizadas
- **Integração automática** com o backend principal

## 🚀 Deploy no Render.com

### Configuração
- **Nome do serviço:** ouvidoria-finalizadas
- **Tipo:** Web Service
- **Runtime:** Python 3.9.16
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app`

### URLs
- **Produção:** https://ouvidoria-finalizadas.onrender.com
- **API Base:** https://ouvidoria-finalizadas.onrender.com/api/finalizadas

## 🔧 Endpoints da API

### Denúncias Finalizadas
- `GET /api/finalizadas` - Lista todas as denúncias finalizadas
- `POST /api/finalizadas` - Adiciona uma denúncia finalizada
- `GET /api/finalizadas/<protocolo>` - Busca denúncia por protocolo
- `PATCH /api/finalizadas/<protocolo>` - Atualiza denúncia finalizada
- `DELETE /api/finalizadas/<protocolo>` - Remove denúncia finalizada

### Estatísticas
- `GET /stats` - Estatísticas das denúncias finalizadas

## 📊 Banco de Dados

### Tabela: denuncias_finalizadas
```sql
CREATE TABLE denuncias_finalizadas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    protocolo TEXT UNIQUE NOT NULL,
    nome TEXT,
    rg TEXT,
    tipo TEXT,
    descricao TEXT,
    youtube TEXT,
    status TEXT DEFAULT 'Finalizada',
    data_criacao TEXT,
    data_finalizacao TEXT,
    observacoes TEXT
);
```

## 🔄 Integração com Backend Principal

Quando uma denúncia é marcada como "Finalizada" no backend principal:

1. **Atualiza** o status no banco principal
2. **Copia** todos os dados para este backend
3. **Mantém** histórico completo das denúncias finalizadas

## 🔒 Segurança

- **Validação** de dados obrigatórios
- **Verificação** de protocolos duplicados
- **Tratamento** de erros robusto
- **Logs** de operações

## 🎯 Uso

1. **Deploy** este repositório no Render.com
2. **Configure** o backend principal para usar a URL do Render
3. **Finalize** denúncias no painel admin
4. **Visualize** finalizadas através do frontend

---

**Desenvolvido para a Polícia Militar da Nova Capital** 🚔 