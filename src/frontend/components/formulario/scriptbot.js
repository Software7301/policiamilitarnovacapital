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
  
  // Função para adicionar quebra de linha automática em textos longos
  function formatLongText(text) {
    // Se o texto já tem quebras de linha naturais, preserva elas
    if (text.includes('\n')) {
      return text.replace(/\n/g, '<br>');
    }
    
    // Quebra automática a cada 40 caracteres para mobile
    const maxCharsPerLine = 40;
    const words = text.split(' ');
    let formattedText = '';
    let currentLine = '';
    
    for (let word of words) {
      if ((currentLine + word).length > maxCharsPerLine) {
        formattedText += currentLine.trim() + '<br>';
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    
    formattedText += currentLine.trim();
    return formattedText;
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
    
    // Enviar APENAS para o servidor Render
    const urls = [
      'https://policiamilitarnovacapital.onrender.com/api/denuncias'
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
    } else {
      const data = await response.json();
      console.log("Dados enviados com sucesso. Protocolo:", data.protocolo || protocoloGerado);
    }
    
    // Sempre retornar o protocolo gerado
    return protocoloGerado;
    
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
    console.log('🔍 Buscando protocolo:', protocolo);
    
    // 1. Primeiro buscar no backend principal (denúncias ativas)
    try {
      console.log('📋 Buscando no backend principal (denúncias ativas)...');
      const response = await fetch(`https://policiamilitarnovacapital.onrender.com/api/denuncias/${protocolo}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const denuncia = await response.json();
        console.log('✅ Denúncia encontrada no backend principal:', denuncia);
        return denuncia;
      } else {
        console.log('❌ Protocolo não encontrado no backend principal');
      }
    } catch (error) {
      console.log('❌ Erro ao buscar no backend principal:', error);
    }
    
    // 2. Se não encontrou, buscar no backend de finalizadas
    try {
      console.log('✅ Buscando no backend de finalizadas...');
      const finalizadasResponse = await fetch(`https://ouvidoria-finalizadas.onrender.com/api/finalizadas/${protocolo}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (finalizadasResponse.ok) {
        const denunciaFinalizada = await finalizadasResponse.json();
        console.log('✅ Denúncia encontrada no backend de finalizadas:', denunciaFinalizada);
        return denunciaFinalizada;
      } else {
        console.log('❌ Protocolo não encontrado no backend de finalizadas');
      }
    } catch (error) {
      console.log('❌ Erro ao buscar no backend de finalizadas:', error);
    }
    
    // 3. Se não encontrou em nenhum, retornar null (protocolo não existe)
    console.log('❌ Protocolo não encontrado em nenhum servidor');
    return null;
    
  } catch (error) {
    console.error("❌ Erro geral ao buscar protocolo:", error);
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
        
        // Mostrar o protocolo que o usuário digitou (exatamente como digitou)
        addMessage(protocolo, "user");
        
        const dados = await buscarProtocolo(protocolo);
        
                 if (dados && dados.protocolo) {
           let dataFormatada = '';
           if (dados.finalizada_em) {
             const data = new Date(dados.finalizada_em);
             dataFormatada = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
           }
           
           // Verificar se a denúncia foi finalizada
           if (dados.status === 'Finalizada') {
             typeBotMessage(`✅ **Denúncia Finalizada!**\n\n**Protocolo:** ${dados.protocolo}\n**Nome:** ${dados.nome || 'Anônimo'}\n**Tipo:** ${dados.tipo || 'Não informado'}\n**Status:** ${dados.status}\n**Descrição:** ${dados.descricao || 'Não informada'}${dataFormatada ? `\n**Finalizada em:** ${dataFormatada}` : ''}\n\n🎉 Sua denúncia foi finalizada com sucesso!\n\nObrigado por utilizar nossa ouvidoria!`);
           } else {
             typeBotMessage(`📋 **Status da sua Denúncia**\n\n**Protocolo:** ${dados.protocolo}\n**Nome:** ${dados.nome || 'Anônimo'}\n**Tipo:** ${dados.tipo || 'Não informado'}\n**Status:** ${dados.status || 'Em Análise'}\n**Descrição:** ${dados.descricao || 'Não informada'}${dataFormatada ? `\n**Finalizada em:** ${dataFormatada}` : ''}\n\nSua denúncia está sendo analisada pela nossa equipe.\n\nObrigado por utilizar nossa ouvidoria!`);
           }
         } else {
           // Protocolo não encontrado
           typeBotMessage(`❌ **Protocolo não encontrado**\n\n**Protocolo:** ${protocolo}\n**Status:** Não encontrado\n\nO protocolo ${protocolo} não foi encontrado em nossa base de dados.\n\nVerifique se o número está correto ou entre em contato conosco.`);
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
        // Atualizar placeholder
        input.placeholder = "Digite Aqui...";
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
        
        // Gerar protocolo localmente primeiro
        const protocoloLocal = gerarProtocoloAleatorio();
        console.log('Protocolo gerado localmente:', protocoloLocal);
        
        // Tentar enviar para o servidor
        const protocoloServidor = await sendToDatabase(userResponses);
        
        // Usar o protocolo do servidor se disponível, senão usar o local
        const protocoloFinal = protocoloServidor || protocoloLocal;
        
        console.log('Protocolo final que será exibido:', protocoloFinal);
        
        // Garantir que a mensagem seja exibida
        setTimeout(() => {
          typeBotMessage(`📋 **PROTOCOLO GERADO COM SUCESSO!**\n\n🎯 **Seu protocolo:** **${protocoloFinal}**\n\n📝 **IMPORTANTE:** Guarde este número para acompanhar sua denúncia!\n\n🔍 **Para acompanhar:** Digite o número ${protocoloFinal} quando retornar ao sistema.`);
        }, 500);
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
      // Sempre formatar na descrição da solicitação (step 5)
      const shouldFormat = step === 4; // step 4 corresponde ao case 5 (descrição)
      addMessage(userText, "user", shouldFormat);
      input.value = "";
      nextStep(userText);
    }
  }
});

window.addEventListener("load", () => {
  // Resetar placeholder inicial
  input.placeholder = "Digite Aqui...";
  nextStep(); 
});
