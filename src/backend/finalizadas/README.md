# 🚔 Backend de Denúncias Finalizadas

Sistema separado para armazenar e gerenciar denúncias que foram finalizadas pela equipe da Ouvidoria.

## 📋 Funcionalidades

- **Armazenamento separado** de denúncias finalizadas
- **API REST completa** para gerenciamento
- **Estatísticas** de denúncias finalizadas
- **Integração automática** com o backend principal

## 🚀 Como Executar

### Pré-requisitos
- Python 3.8+
- Flask e Flask-CORS instalados

### Instalação
```bash
cd src/backend/finalizadas
pip install -r requirements.txt
python app.py
```

### Script Automático
Execute o arquivo `start_backends.bat` na raiz do projeto para iniciar ambos os backends.

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
2. **Copia** todos os dados para o backend de finalizadas
3. **Mantém** histórico completo das denúncias finalizadas

## 🌐 Frontend

Acesse `src/frontend/pages/finalizadas.html` para visualizar:
- Lista de todas as denúncias finalizadas
- Estatísticas por tipo
- Filtros por data e tipo
- Busca por protocolo, nome ou descrição

## 📈 Estatísticas Disponíveis

- **Total de finalizadas**
- **Por tipo** (Denúncia, Elogio, Sugestão)
- **Por mês** (últimos 12 meses)

## 🔒 Segurança

- **Validação** de dados obrigatórios
- **Verificação** de protocolos duplicados
- **Tratamento** de erros robusto
- **Logs** de operações

## 🎯 Uso

1. **Inicie** ambos os backends
2. **Acesse** o frontend
3. **Finalize** denúncias no painel admin
4. **Visualize** finalizadas na página específica

---

**Desenvolvido para a Polícia Militar da Nova Capital** 🚔 