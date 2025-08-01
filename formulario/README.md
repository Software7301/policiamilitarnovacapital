# Formulário de Denúncia - Ouvidoria PM NC

Este é um formulário independente para denúncias da Polícia Militar da Nova Capital.

## 📁 Estrutura dos Arquivos

```
formulario/
├── index.html      # Página principal do formulário
├── style.css       # Estilos CSS
├── script.js       # Funcionalidades JavaScript
└── README.md       # Este arquivo
```

## 🚀 Como Usar

1. **Abra o arquivo**: `formulario/index.html` em qualquer navegador
2. **Preencha os campos**: Todos os campos obrigatórios devem ser preenchidos
3. **Envie o formulário**: Clique em "Enviar Denúncia"
4. **Aguarde**: O sistema simula o envio e gera um protocolo

## ✨ Características

### 🎨 Design
- **Tema Habblet**: Design inspirado em pixel-art
- **Responsivo**: Funciona em desktop, tablet e mobile
- **Animações**: Transições suaves e efeitos visuais
- **Cores**: Gradiente azul/teal com elementos translúcidos

### 📝 Campos do Formulário
- **Nome Completo** (opcional)
- **RG** (obrigatório)
- **Tipo de Solicitação** (obrigatório)
  - Denúncia
  - Elogio
  - Sugestão
- **Descrição** (obrigatório)
- **Link do YouTube** (opcional)

### ⚡ Funcionalidades
- **Validação em tempo real**: Campos obrigatórios são verificados
- **Loading animado**: Feedback visual durante o envio
- **Protocolo automático**: Geração de número de protocolo
- **Prevenção de envio duplo**: Evita múltiplos envios
- **Confirmação de saída**: Alerta se há dados não salvos

## 🔧 Personalização

### Cores
As cores podem ser alteradas no arquivo `style.css`:
```css
:root {
    --habblet-blue: #1e3a8a;
    --habblet-teal: #0d9488;
    --habblet-light-blue: #3b82f6;
    --habblet-gray: #94a3b8;
}
```

### Integração com API
Para conectar com uma API real, modifique a função de envio em `script.js`:
```javascript
// Substitua a simulação por uma chamada real
fetch('/api/denuncias', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    // Tratar resposta da API
});
```

## 📱 Responsividade

O formulário é totalmente responsivo:
- **Desktop**: Layout em grid com campos lado a lado
- **Tablet**: Campos empilhados, botões menores
- **Mobile**: Layout otimizado para toque

## 🎯 Compatibilidade

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## 📄 Licença

Este projeto é parte do sistema da Ouvidoria da Polícia Militar da Nova Capital.

## 🆘 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento. 