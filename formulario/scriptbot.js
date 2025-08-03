emailjs.init('j5NUxYV1wKXAIsRuI');

const chatContainer = document.querySelector(".messages-content");
const input = document.querySelector(".message-input");
const sendBtn = document.querySelector(".message-submit");

let step = 0;
const userResponses = [];
let modo = '';

function addMessage(content, sender = "bot", shouldFormat = false) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  
  // Função para adicionar quebra de linha em textos longos
  function formatLongText(text) {
    // Se o texto já tem quebras de linha naturais, preserva elas
    if (text.includes('\n')) {
      return text.replace(/\n/g, '<br>');
    }
    
    // Se o texto é muito longo, adiciona quebras automáticas
    if (text.length > 60) {
      // Quebra a cada 60 caracteres, mas respeita palavras
      const words = text.split(' ');
      let formattedText = '';
      let currentLine = '';
      
      for (let word of words) {
        if ((currentLine + word).length > 60) {
          formattedText += currentLine.trim() + '<br>';
          currentLine = word + ' ';
        } else {
          currentLine += word + ' ';
        }
      }
      
      formattedText += currentLine.trim();
      return formattedText;
    }
    return text;
  }
  
  if (sender === "user") {
    messageDiv.classList.add("message-personal");
    messageDiv.innerHTML = `
      <div class="message-text">${shouldFormat ? formatLongText(content) : content}</div>
    `;
  } else {
    const avatarImg = '../assets/Logo_PMESP.png'; 
    messageDiv.innerHTML = `
      <img src="${avatarImg}" alt="avatar" class="avatar" />
      <div class="message-text">${formatLongText(content)}</div>
    `;
  }

  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function typeBotMessage(text, callback) {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "bot", "typing");
  typingDiv.innerHTML = `
    <div class="message-text">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>
  `;
  chatContainer.appendChild(typingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  setTimeout(() => {
    typingDiv.remove();
    addMessage(text, "bot");
    if (callback) callback();
  }, 1000);
}

// Função para gerar protocolo aleatório de 0001 até 9999
function gerarProtocoloAleatorio() {
  const min = 1;
  const max = 9999;
  const protocolo = Math.floor(Math.random() * (max - min + 1)) + min;
  return protocolo.toString().padStart(4, '0');
}

async function sendToDatabase(responses) {
  try {
    console.log('Enviando dados:', responses);
    
    // Gerar protocolo aleatório
    const protocoloGerado = gerarProtocoloAleatorio();
    console.log('Protocolo gerado:', protocoloGerado);
    
    // Criar objeto da denúncia
    const denuncia = {
      protocolo: protocoloGerado,
      nome: responses[0] || 'Anônimo',
      rg: responses[1],
      tipo: responses[2],
      descricao: responses[3],
      youtube: responses[4] || '',
      status: 'Em Análise',
      dataCriacao: new Date().toISOString()
    };
    
    // Enviar APENAS para o servidor (sem localStorage)
    const urls = [
      'https://policiamilitarnovacapital.onrender.com/api/denuncias',
      'https://policiamilitarnovacapital.onrender.com/',
      'http://localhost:5000/api/denuncias',
      'http://127.0.0.1:5000/api/denuncias',
      'http://localhost:8000/api/denuncias'
    ];
    
    let response = null;
    let lastError = null;
    
    for (const url of urls) {
      try {
        console.log('Tentando URL:', url);
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(denuncia)
        });
        
        console.log('Status da resposta:', response.status);
        
        if (response.ok) {
          console.log('✅ Denúncia enviada para o servidor com sucesso!');
          break;
        } else {
          console.log('Erro HTTP:', response.status, response.statusText);
        }
      } catch (error) {
        console.log('Erro na URL:', url, error);
        lastError = error;
        continue;
      }
    }
    
    if (!response || !response.ok) {
      console.error("Todas as URLs falharam. Último erro:", lastError);
      console.log("Retornando protocolo gerado:", protocoloGerado);
      return protocoloGerado;
    } else {
      const data = await response.json();
      console.log("Dados enviados com sucesso. Protocolo do servidor:", data.protocolo);
      console.log("Protocolo final que será exibido:", data.protocolo || protocoloGerado);
      // Usar o protocolo do servidor se disponível, senão usar o gerado
      return data.protocolo || protocoloGerado;
    }
    
  } catch (error) {
    console.error("Erro ao enviar dados:", error);
    // Em caso de erro, gerar novo protocolo e retornar
    const protocoloGerado = gerarProtocoloAleatorio();
    console.log("Erro - retornando novo protocolo:", protocoloGerado);
    return protocoloGerado;
  }
}

async function buscarProtocolo(protocolo) {
  try {
    // Buscar APENAS no servidor
    console.log('Buscando protocolo no servidor...');
    
    const urls = [
      'https://policiamilitarnovacapital.onrender.com/api/denuncias',
      'https://policiamilitarnovacapital.onrender.com/',
      'http://localhost:5000/api/denuncias',
      'http://127.0.0.1:5000/api/denuncias',
      'http://localhost:8000/api/denuncias'
    ];
    
    for (const url of urls) {
      try {
        console.log('Tentando buscar em:', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const denuncias = await response.json();
          console.log('Denúncias encontradas no servidor:', denuncias);
          
          const denuncia = denuncias.find(d => d.protocolo === protocolo);
          
          if (denuncia) {
            console.log('Denúncia encontrada no servidor:', denuncia);
            return denuncia;
          }
        }
      } catch (error) {
        console.log('Erro ao buscar em:', url, error);
        continue;
      }
    }
    
    console.log('Protocolo não encontrado no servidor');
    return null;
  } catch (error) {
    console.error("Erro ao buscar protocolo:", error);
    return null;
  }
}



function sendEmail(responses) {
  emailjs.send("service_ikpwz1g", "template_5yyfejt", {
    nome: responses[0] || 'Anônimo',
    rg: responses[1],
    tipo: responses[2],
    descricao: responses[3],
    youtube: responses[4]
  })
  .then(() => console.log("Email enviado com sucesso."))
  .catch((error) => console.error("Erro ao enviar email:", error));
}

async function nextStep(userText) {
  if (userText) {
    // Aplicar formatação apenas na descrição da solicitação (step 5)
    const shouldFormat = step === 4; // step 4 corresponde ao case 5 (descrição)
    addMessage(userText, "user", shouldFormat);
    userResponses.push(userText);
  }

  step++;

  switch (step) {
    case 1:
      typeBotMessage("👋 Olá, seja bem-vindo à Ouvidoria da Polícia Militar!\n\nO que você gostaria de fazer?\n\n1️⃣ Fazer uma Denúncia\n2️⃣ Acompanhar uma Denúncia\n\n💡 **Dica:** Se você já tem um protocolo, pode digitar diretamente o número (ex: 0001)");
      break;
    case 2:
      const escolha = userResponses[0];
      if (escolha === '1') {
        modo = 'denunciar';
        userResponses.length = 0;
        typeBotMessage("Me diga seu nome e sobrenome (opcional):");
      } else if (escolha === '2') {
        modo = 'acompanhar';
        typeBotMessage("Informe por gentileza o número do seu Protocolo:");
      } else {
        // Verificar se é um protocolo (4 dígitos)
        if (escolha.length === 4 && /^\d{4}$/.test(escolha)) {
          // É um protocolo, processar diretamente
          modo = 'acompanhar';
          userResponses[0] = '2'; // Simular que escolheu acompanhar
          userResponses.push(escolha); // Adicionar o protocolo
          step = 2; // Pular para o case 3
          nextStep(); // Processar imediatamente
          return;
        } else {
          typeBotMessage("Opção inválida. Digite 1 para fazer uma denúncia ou 2 para acompanhar uma denúncia:");
          step = 1;
          userResponses.pop();
        }
      }
      break;
    case 3:
      if (modo === 'acompanhar') {
        const protocolo = userResponses[1];
        const dados = await buscarProtocolo(protocolo);
        
        if (dados) {
          let dataFormatada = '';
          if (dados.finalizada_em) {
            const data = new Date(dados.finalizada_em);
            dataFormatada = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
          }
          
          // Verificar se a denúncia foi finalizada
          if (dados.status === 'Finalizada') {
            typeBotMessage(`✅ **Denúncia Finalizada!**\n\n**Protocolo:** ${dados.protocolo}\n**Nome:** ${dados.nome || 'Anônimo'}\n**Tipo:** ${dados.tipo}\n**Status:** ${dados.status}\n**Descrição:** ${dados.descricao}${dataFormatada ? `\n**Finalizada em:** ${dataFormatada}` : ''}\n\n🎉 Sua denúncia foi finalizada com sucesso!\n\nObrigado por utilizar nossa ouvidoria!`);
          } else {
            typeBotMessage(`📋 **Status da sua Denúncia**\n\n**Protocolo:** ${dados.protocolo}\n**Nome:** ${dados.nome || 'Anônimo'}\n**Tipo:** ${dados.tipo}\n**Status:** ${dados.status}\n**Descrição:** ${dados.descricao}${dataFormatada ? `\n**Finalizada em:** ${dataFormatada}` : ''}\n\nSua denúncia está sendo analisada pela nossa equipe.\n\nObrigado por utilizar nossa ouvidoria!`);
          }
        } else {
          typeBotMessage("📋 **Status da sua Denúncia**\n\n**Protocolo:** " + protocolo + "\n**Status:** Em Análise\n\nSua denúncia está sendo analisada pela nossa equipe.\n\nObrigado por utilizar nossa ouvidoria!");
        }
      } else {
        typeBotMessage("✅ Agora informe seu número de RG:");
      }
      break;
    case 4:
      if (modo === 'denunciar') {
        typeBotMessage("📋 Qual o tipo de solicitação?\n\n1️⃣ Denúncia\n2️⃣ Elogio\n3️⃣ Sugestão\n\nDigite o número da opção desejada:");
        // Resetar placeholder
        input.placeholder = "Digite Aqui...";
      }
      break;
    case 5:
      if (modo === 'denunciar') {
        typeBotMessage("📝 Descreva sua solicitação:");
        // Atualizar placeholder para indicar que quebra de linha está disponível
        input.placeholder = "Digite Aqui... (Shift+Enter para quebra de linha)";
      }
      break;
    case 6:
      if (modo === 'denunciar') {
        typeBotMessage("🎥 Se você tem um link do YouTube relacionado, cole aqui (opcional):");
        // Resetar placeholder
        input.placeholder = "Digite Aqui...";
      }
      break;
    case 7:
      if (modo === 'denunciar') {
        typeBotMessage("✅ Obrigado! Suas informações foram enviadas para análise.");
        const protocolo = await sendToDatabase(userResponses);
        if (protocolo) {
          typeBotMessage(`📋 **PROTOCOLO GERADO COM SUCESSO!**\n\n🎯 **Seu protocolo:** **${protocolo}**\n\n📝 **IMPORTANTE:** Guarde este número para acompanhar sua denúncia!\n\n🔍 **Para acompanhar:** Digite o número ${protocolo} quando retornar ao sistema.`);
        } else {
          typeBotMessage("⚠️ Houve um erro ao salvar suas informações. Tente novamente mais tarde.");
        }
      }
      break;
    default:
      typeBotMessage("Não há mais perguntas.");
  }
}

sendBtn.addEventListener("click", () => {
  const userText = input.value.trim();
  if (userText) {
    // Aplicar formatação apenas na descrição da solicitação (step 5)
    const shouldFormat = step === 4; // step 4 corresponde ao case 5 (descrição)
    addMessage(userText, "user", shouldFormat);
    input.value = "";
    nextStep(userText);
  }
});

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const userText = input.value.trim();
    if (userText) {
      // Aplicar formatação apenas na descrição da solicitação (step 5)
      const shouldFormat = step === 4; // step 4 corresponde ao case 5 (descrição)
      addMessage(userText, "user", shouldFormat);
      input.value = "";
      nextStep(userText);
    }
  } else if (e.key === "Enter" && e.shiftKey) {
    // Permite quebra de linha com Shift+Enter
    e.preventDefault();
    input.value += '\n';
  }
});

window.addEventListener("load", () => {
  // Resetar placeholder inicial
  input.placeholder = "Digite Aqui...";
  nextStep(); 
});
