# Sistema de Ouvidoria PM

Este projeto inclui um sistema completo de ouvidoria para a Polícia Militar com formulário interativo para denúncias, elogios e sugestões.

## Funcionalidades

### 1. Formulário de Ouvidoria
- Chat interativo para coleta de informações
- Dados salvos no banco de dados SQLite
- Protocolo automático gerado (formato: 0001, 0002, etc.)
- Tipos de solicitação: Denúncia, Elogio, Sugestão

### 2. Painel Administrativo
- Login com senha (PMNC)
- Visualização de denúncias, elogios e sugestões
- Visualização de interessados no COE
- Gerenciamento de status das solicitações

## Estrutura do Projeto

```
projetoouvidoria/
├── backend/
│   ├── app.py          # API Flask
│   ├── models.py       # Modelos de dados
│   └── ouvidoria.db    # Banco de dados SQLite
├── formulario/
│   ├── index.html      # Página do formulário
│   └── scriptbot.js    # Script do chat
├── admin/
│   ├── admin.html      # Painel administrativo
│   ├── script.js       # Script do painel
│   └── style.css       # Estilos do painel
└── index.html          # Página principal
```

## Como Executar

### 1. Configurar o Backend
```bash
cd backend
python app.py
```

O servidor Flask será iniciado em `http://localhost:5000`

### 2. Acessar o Sistema

- **Formulário**: `http://localhost:5000/formulario/`
- **Painel Admin**: `http://localhost:5000/admin/`
  - Senha: `PMNC`

## Formulário de Ouvidoria

### Perguntas do Chat:
1. **Nome e Sobrenome** (Opcional)
2. **RG** (Obrigatório)
3. **Tipo de Solicitação**:
   - 1️⃣ Denúncia
   - 2️⃣ Elogio
   - 3️⃣ Sugestão
4. **Descrição** (Obrigatório)
5. **Link do YouTube** (Opcional)

## Banco de Dados

### Tabela: denuncias
- `id`: ID único
- `protocolo`: Protocolo único (0001, 0002, etc.)
- `nome`: Nome completo (opcional, padrão: "Anônimo")
- `rg`: Número do RG
- `tipo`: Tipo de solicitação (Denúncia, Elogio, Sugestão)
- `descricao`: Descrição da solicitação
- `youtube`: Link do YouTube (opcional)
- `status`: Status da solicitação (Em análise, Finalizada)
- `finalizada_em`: Data/hora de finalização

### Tabela: interessados_coe
- Mantém a estrutura original para interessados no COE

## API Endpoints

### Denúncias/Elogios/Sugestões
- `POST /api/denuncias` - Criar nova solicitação
- `GET /api/denuncias` - Listar todas as solicitações
- `PATCH /api/denuncias/<protocolo>` - Atualizar status

### Interessados COE
- `POST /api/interessados-coe` - Criar novo interessado
- `GET /api/interessados-coe` - Listar todos os interessados
- `PATCH /api/interessados-coe/<protocolo>` - Atualizar status

## Funcionalidades do Painel Admin

1. **Aba Denúncias**: Visualizar e gerenciar denúncias, elogios e sugestões
2. **Aba Interessados COE**: Visualizar e gerenciar interessados no COE
3. **Gerenciamento de Status**: Atualizar status das solicitações
4. **Interface Responsiva**: Funciona em desktop e mobile

## Tecnologias Utilizadas

- **Backend**: Flask, SQLite
- **Frontend**: HTML, CSS, JavaScript
- **API**: RESTful com CORS habilitado
- **Chat**: Sistema interativo com EmailJS (mantido como backup)

## Configuração de Produção

Para deploy em produção, altere as URLs nos arquivos JavaScript:
- `formulario/scriptbot.js`: Linha 47
- `admin/script.js`: Linhas 58, 75, 120

Substitua `http://localhost:5000` pela URL do seu servidor. 