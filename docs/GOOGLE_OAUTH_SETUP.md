# 🔐 Configuração do Google OAuth para Painel Admin

## ✅ O que você já tem:
- Client ID: `759670506611-0kvv5vfd8rmc7a53h0c4aktcc42seqiu.apps.googleusercontent.com`

## 🚨 ERRO ATUAL: "Algo deu errado"

**O erro que você está vendo indica que as URLs não estão configuradas corretamente no Google Cloud Console.**

### 🔧 SOLUÇÃO IMEDIATA:

1. **Acesse o Google Cloud Console:**
   - Vá para: https://console.cloud.google.com/
   - Selecione seu projeto
   
2. **Configure as URLs autorizadas:**
   - Vá em **APIs & Services** → **Credentials**
   - Clique no seu OAuth 2.0 Client ID
   - Em **Authorized JavaScript origins**, adicione:
   ```
   http://127.0.0.1:5500
   http://localhost:5500
   https://policiamilitarnovacapital.onrender.com
   ```
   - Em **Authorized redirect URIs**, adicione:
   ```
   http://127.0.0.1:5500/admin/admin.html
   http://localhost:5500/admin/admin.html
   https://policiamilitarnovacapital.onrender.com/admin/admin.html
   ```

3. **Clique em "Save"**

4. **Aguarde 5-10 minutos** para as mudanças propagarem

## 🔧 O que ainda precisa configurar:

### 1. **Origins JavaScript autorizados**
No Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs:

**Adicione estas URLs:**
```
http://localhost:5500
http://127.0.0.1:5500
https://policiamilitarnovacapital.onrender.com
```

### 2. **Redirect URIs autorizados**
**Adicione estas URLs:**
```
http://localhost:5500/admin/admin.html
http://127.0.0.1:5500/admin/admin.html
https://policiamilitarnovacapital.onrender.com/admin/admin.html
```

### 3. **Ativar APIs necessárias**
No Google Cloud Console > APIs & Services > Library:

**Ative estas APIs:**
- ✅ Google+ API
- ✅ Google Identity API
- ✅ Google Sign-In API

### 4. **Configurar tela de consentimento OAuth**
No Google Cloud Console > APIs & Services > OAuth consent screen:

**Informações obrigatórias:**
- App name: "Painel PM NC"
- User support email: seu email
- Developer contact information: seu email

**Escopos necessários:**
- `openid`
- `email`
- `profile`

### 5. **Verificar configurações de segurança**
No Google Cloud Console > APIs & Services > OAuth consent screen:

**Usuários de teste:**
- Adicione seu email como usuário de teste
- Ou deixe como "External" se for para uso público

## 🧪 Como testar:

### **Opção 1: Teste local**
1. Abra `http://localhost:5500/admin/admin.html`
2. Clique em "Entrar com Google"
3. Deve aparecer o popup do Google

### **Opção 2: Teste no servidor**
1. Abra `https://policiamilitarnovacapital.onrender.com/admin/admin.html`
2. Clique em "Entrar com Google"
3. Deve funcionar se as URLs estiverem configuradas

## 🔍 Verificação de problemas:

### **Se ainda não funcionar:**
1. Abra o Console do navegador (F12)
2. Procure por erros relacionados ao Google
3. Verifique se o Client ID está correto
4. Confirme se as URLs estão exatamente como configuradas

### **Mensagens de erro comuns:**
- `"popup_closed_by_user"` = Usuário fechou o popup (normal)
- `"access_denied"` = Usuário negou permissão
- `"invalid_client"` = Client ID incorreto
- `"redirect_uri_mismatch"` = URL não configurada
- `"Algo deu errado"` = URLs não autorizadas no Google Cloud Console

## 📝 Notas importantes:

1. **Para desenvolvimento local:** Use `localhost:5500` ou `127.0.0.1:5500`
2. **Para produção:** Use `https://policiamilitarnovacapital.onrender.com`
3. **Client ID:** Deve ser o mesmo em todas as URLs
4. **HTTPS:** Necessário para produção, HTTP OK para localhost
5. **Aguarde:** Mudanças no Google Cloud Console podem levar 5-10 minutos para propagar

## 🚀 Após configurar tudo:

1. Recarregue a página do painel
2. Clique em "Entrar com Google"
3. Deve aparecer o popup do Google para login
4. Após login, será redirecionado para o painel

---

**Status atual:** ✅ Client ID configurado
**Erro atual:** ❌ URLs não autorizadas no Google Cloud Console
**Próximo passo:** Configurar Origins e Redirect URIs no Google Cloud Console 