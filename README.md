# 🚔 Ouvidoria da Polícia Militar da Nova Capital

Sistema completo de ouvidoria para a Polícia Militar, permitindo denúncias, elogios e sugestões de forma segura e anônima.

## 📋 Funcionalidades

### ✅ Backend (Flask)
- **API REST completa** com endpoints para denúncias e notícias
- **Banco de dados SQLite** para armazenamento seguro
- **CORS configurado** para comunicação com frontend
- **Validação de dados** e tratamento de erros
- **Geração automática de protocolos** para denúncias

### ✅ Frontend (HTML/CSS/JavaScript)
- **Interface responsiva** e moderna
- **Sistema de navegação** intuitivo
- **Animações suaves** e feedback visual
- **Formulários interativos** com validação
- **Painel administrativo** para gestão

### ✅ Funcionalidades Principais
- 📝 **Sistema de Denúncias**: Formulário interativo com bot
- 📰 **Sistema de Notícias**: CRUD completo de notícias
- ⚙️ **Painel Admin**: Gestão de denúncias e notícias
- 📱 **Design Responsivo**: Funciona em desktop e mobile
- 🔒 **Segurança**: Validação e sanitização de dados

## 🚀 Como Executar

### 🌐 Servidor Online (Produção)

O projeto está hospedado no **Render.com** e pode ser acessado em:
**https://policiamilitarnovacapital.onrender.com**

### 💻 Desenvolvimento Local

#### Pré-requisitos
- Python 3.8+
- pip (gerenciador de pacotes Python)

#### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/Software7301/policiamilitarnovacapital.git
cd policiamilitarnovacapital
```

2. **Ative o ambiente virtual**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Instale as dependências**
```bash
pip install -r src/backend/requirements.txt
```

4. **Execute o backend (opcional)**
```bash
cd src/backend/api
python app.py
```

5. **Acesse o sistema**
- **Frontend**: Abra `src/frontend/pages/index.html` no navegador
- **Denúncias**: Abra `src/frontend/pages/denunciar.html` no navegador
- **Notícias**: Abra `src/frontend/pages/noticias.html` no navegador
- **Admin**: Abra `src/frontend/components/admin/admin.html` no navegador

**Nota:** O sistema está configurado para usar apenas o servidor Render em produção.

## 🧪 Testes

### Teste Rápido
```bash
python tests/test_rapido.py
```

## 📁 Estrutura do Projeto

```
projetoouvidoria/
├── src/
│   ├── frontend/
│   │   ├── pages/              # Páginas HTML
│   │   │   ├── index.html      # Página inicial
│   │   │   ├── denunciar.html  # Sistema de denúncias
│   │   │   └── noticias.html   # Sistema de notícias
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── admin/          # Painel administrativo
│   │   │   └── formulario/     # Formulário de denúncias
│   │   ├── assets/             # Recursos estáticos
│   │   │   └── Logo_PMESP.png  # Logo da PM
│   │   ├── styles/             # Arquivos CSS
│   │   │   └── style.css       # Estilos principais
│   │   └── scripts/            # Arquivos JavaScript
│   │       └── script.js       # Script principal
│   └── backend/
│       ├── api/                # API Flask
│       │   └── app.py          # Aplicação principal
│       ├── database/           # Banco de dados
│       │   └── ouvidoria.db    # Banco SQLite
│       ├── utils/              # Utilitários
│       └── requirements.txt    # Dependências Python
├── tests/                      # Testes automatizados
│   └── test_rapido.py         # Teste rápido do sistema
├── docs/                       # Documentação
├── package.json                # Configuração do projeto
├── .gitignore                  # Arquivos ignorados pelo Git
├── render.yaml                 # Configuração de deploy
├── runtime.txt                 # Versão do Python
└── README.md                   # Documentação principal
```

## 🔧 Endpoints da API

### Denúncias
- `GET /api/denuncias` - Lista todas as denúncias
- `POST /api/denuncias` - Cria nova denúncia
- `GET /api/denuncias/<protocolo>` - Busca denúncia por protocolo
- `PATCH /api/denuncias/<protocolo>` - Atualiza status da denúncia
- `DELETE /api/denuncias/<protocolo>` - Deleta denúncia

### Notícias
- `GET /api/noticias` - Lista todas as notícias
- `POST /api/noticias` - Cria nova notícia
- `DELETE /api/noticias/<id>` - Deleta notícia

### Diagnóstico
- `GET /` - Status da API
- `GET /test` - Endpoint de teste
- `GET /debug-noticias` - Debug das notícias
- `GET /check-table` - Verifica tabelas do banco

## 🎨 Tecnologias Utilizadas

### Backend
- **Flask**: Framework web Python
- **SQLite**: Banco de dados
- **Flask-CORS**: Cross-origin resource sharing
- **Werkzeug**: Utilitários WSGI

### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos e responsivos
- **JavaScript**: Interatividade e animações
- **EmailJS**: Integração com email

## 🔒 Segurança

- ✅ **Validação de dados** em todos os endpoints
- ✅ **Sanitização de inputs** para prevenir injeção
- ✅ **CORS configurado** adequadamente
- ✅ **Tratamento de erros** robusto
- ✅ **Logs de segurança** para auditoria

## 📊 Status do Sistema

- ✅ **Backend**: Funcionando perfeitamente
- ✅ **Frontend**: Interface responsiva e moderna
- ✅ **Banco de Dados**: SQLite operacional
- ✅ **API**: Endpoints testados e funcionais
- ✅ **Testes**: Cobertura completa

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas, entre em contato através do sistema de issues do GitHub.

---

**Desenvolvido com ❤️ para a Polícia Militar da Nova Capital** 