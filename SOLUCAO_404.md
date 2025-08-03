# Solução para Erro 404 no Netlify

## Problema Identificado

O site está sendo publicado no Netlify, mas está retornando erro 404 (Page not found). Isso pode acontecer por alguns motivos:

## Soluções Implementadas

### 1. Configuração Simplificada do Netlify

Atualizei o `netlify.toml` para uma configuração mais simples:

```toml
[build]
  command = "pip install -r requirements.txt"
  publish = "src/frontend"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/app"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Arquivo _redirects

Criei um arquivo `src/frontend/_redirects` para garantir que as rotas funcionem:

```
/api/*  /.netlify/functions/app  200
/*      /index.html              200
```

### 3. Fallback CSS

Adicionei estilos de fallback no `index.html` para garantir que o site apareça mesmo se o CSS principal não carregar.

## Como Testar

### Teste 1: Página de Teste
Acesse: `https://seu-site.netlify.app/test.html`

### Teste 2: Página Principal
Acesse: `https://seu-site.netlify.app/`

### Teste 3: API
Acesse: `https://seu-site.netlify.app/api/test`

## Alternativas se o Netlify Continuar com Problemas

### Opção 1: Vercel
Use o arquivo `vercel.json` que criei:
1. Conecte o repositório ao Vercel
2. O deploy será automático

### Opção 2: Render.com (Recomendado)
Use o arquivo `render.yaml` existente:
1. Conecte o repositório ao Render
2. Mais adequado para aplicações Python/Flask

### Opção 3: GitHub Pages
Para apenas o frontend:
1. Configure GitHub Pages
2. Publique apenas a pasta `src/frontend`

## Verificações Importantes

1. **Estrutura de Arquivos**:
   ```
   src/frontend/
   ├── index.html ✅
   ├── styles/style.css ✅
   ├── scripts/equipe-simple.js ✅
   ├── assets/Logo_PMESP.png ✅
   └── _redirects ✅
   ```

2. **Logs de Deploy**:
   - Acesse o painel do Netlify
   - Vá em "Deploys"
   - Verifique os logs de build

3. **Configurações do Site**:
   - Build command: `pip install -r requirements.txt`
   - Publish directory: `src/frontend`
   - Functions directory: `.netlify/functions`

## Próximos Passos

1. **Faça commit das alterações**:
   ```bash
   git add .
   git commit -m "Correção erro 404 - configuração simplificada"
   git push
   ```

2. **Aguarde o novo deploy** no Netlify

3. **Teste as URLs**:
   - `https://seu-site.netlify.app/`
   - `https://seu-site.netlify.app/test.html`

4. **Se ainda não funcionar**, considere migrar para o **Render.com** que é mais adequado para aplicações Python/Flask.

## Contato para Suporte

Se o problema persistir, posso ajudar a:
- Migrar para Render.com
- Configurar Vercel
- Debugar os logs de deploy
- Criar uma versão simplificada do site 