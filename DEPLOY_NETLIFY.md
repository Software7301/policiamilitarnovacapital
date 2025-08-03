# Deploy no Netlify

## Configuração Atual

O projeto está configurado para deploy no Netlify com as seguintes configurações:

### Arquivos de Configuração

1. **netlify.toml** - Configuração principal do Netlify
2. **build.sh** - Script de build personalizado
3. **requirements.txt** - Dependências Python
4. **runtime.txt** - Versão do Python (3.9.16)

### Estrutura do Deploy

```
projetoouvidoria/
├── src/
│   ├── frontend/          # Arquivos estáticos (HTML/CSS/JS)
│   │   ├── index.html     # Página inicial
│   │   ├── styles/
│   │   ├── scripts/
│   │   └── assets/
│   └── backend/
│       └── api/
│           └── app.py     # API Flask
├── netlify.toml          # Configuração Netlify
├── build.sh              # Script de build
├── requirements.txt       # Dependências Python
└── runtime.txt           # Versão Python
```

## Como Fazer o Deploy

### Opção 1: Deploy Automático via GitHub

1. Conecte seu repositório GitHub ao Netlify
2. Configure as seguintes opções:
   - **Build command**: `chmod +x build.sh && ./build.sh`
   - **Publish directory**: `src/frontend`
   - **Functions directory**: `.netlify/functions`

### Opção 2: Deploy Manual

1. Faça push das alterações para o GitHub
2. O Netlify detectará automaticamente as mudanças
3. O build será executado usando o script `build.sh`

## Variáveis de Ambiente (Opcional)

Configure no painel do Netlify se necessário:

- `DISCORD_GUILD_ID` - ID do servidor Discord
- `DISCORD_BOT_TOKEN` - Token do bot Discord
- `PYTHON_VERSION` - Versão do Python (3.9.16)

## Troubleshooting

### Problema: Build falha na etapa "Initializing"
**Solução**: Verifique se todos os arquivos estão no lugar correto:
- `netlify.toml` na raiz
- `build.sh` na raiz
- `requirements.txt` na raiz
- `src/frontend/index.html` existe

### Problema: API não responde
**Solução**: Verifique se o redirect está correto no `netlify.toml`:
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/app"
  status = 200
```

### Problema: Frontend não carrega
**Solução**: Verifique se o diretório `src/frontend` contém:
- `index.html`
- `styles/style.css`
- `scripts/equipe-simple.js`
- `assets/Logo_PMESP.png`

## Alternativa: Render.com

Se o Netlify continuar com problemas, considere usar o Render.com que é mais adequado para aplicações Python/Flask:

1. Use o arquivo `render.yaml` existente
2. Conecte o repositório ao Render
3. O deploy será automático

## URLs de Teste

Após o deploy, teste:

- **Frontend**: `https://seu-site.netlify.app`
- **API**: `https://seu-site.netlify.app/api/test`
- **Home**: `https://seu-site.netlify.app/`

## Logs de Deploy

Para verificar logs de erro:
1. Acesse o painel do Netlify
2. Vá em "Deploys"
3. Clique no deploy que falhou
4. Verifique os logs de build 