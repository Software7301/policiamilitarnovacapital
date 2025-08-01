emailjs.init('j5NUxYV1wKXAIsRuI');

const chatContainer = document.querySelector(".messages-content");
const input = document.querySelector(".message-input");
const sendBtn = document.querySelector(".message-submit");

let step = 0;
const userResponses = [];

function addMessage(content, sender = "bot") {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  if (sender === "user") {
    messageDiv.classList.add("message-personal");
    messageDiv.innerHTML = `
      <div class="message-text">${content}</div>
    `;
  } else {
    const avatarImg = 'avatar/avatar.png'; 
    messageDiv.innerHTML = `
      <img src="${avatarImg}" alt="avatar" class="avatar" />
      <div class="message-text">${content}</div>
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

async function sendToDatabase(responses) {
  try {
    console.log('Enviando dados:', responses);
    
    // Tentar diferentes URLs (incluindo Render)
    const urls = [
      'https://ouvidoria-pm-backend.onrender.com/api/denuncias',
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
          },
          body: JSON.stringify({
            nome: responses[0] || 'Anônimo',
            rg: responses[1],
            tipo: responses[2],
            descricao: responses[3],
            youtube: responses[4] || ''
          })
        });
        
        if (response.ok) {
          break;
        }
      } catch (error) {
        console.log('Erro na URL:', url, error);
        lastError = error;
        continue;
      }
    }
    
    if (!response || !response.ok) {
      console.error("Todas as URLs falharam. Último erro:", lastError);
      return null;
    }
    
    console.log('Status da resposta:', response.status);
    
    const data = await response.json();
    console.log("Dados enviados com sucesso. Protocolo:", data.protocolo);
    return data.protocolo;
    
  } catch (error) {
    console.error("Erro ao enviar dados:", error);
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
    addMessage(userText, "user");
    userResponses.push(userText);
  }

  step++;

  switch (step) {
    case 1:
      typeBotMessage("👋 Olá, seja bem-vindo à Ouvidoria da Polícia Militar. Me diga seu nome e sobrenome (opcional):");
      break;
    case 2:
      typeBotMessage("✅ Agora informe seu número de RG:");
      break;
    case 3:
      typeBotMessage("📋 Qual o tipo de solicitação?\n\n1️⃣ Denúncia\n2️⃣ Elogio\n3️⃣ Sugestão\n\nDigite o número da opção desejada:");
      break;
    case 4:
      typeBotMessage("📝 Descreva sua solicitação:");
      break;
    case 5:
      typeBotMessage("🎥 Se você tem um link do YouTube relacionado, cole aqui (opcional):");
      break;
    case 6:
      typeBotMessage("✅ Obrigado! Suas informações foram enviadas para análise.");
      const protocolo = await sendToDatabase(userResponses);
      if (protocolo) {
        typeBotMessage(`📋 Seu protocolo é: ${protocolo}`);
      } else {
        typeBotMessage("⚠️ Houve um erro ao salvar suas informações. Tente novamente mais tarde.");
      }
      break;
    default:
      typeBotMessage("Não há mais perguntas.");
  }
}

sendBtn.addEventListener("click", () => {
  const userText = input.value.trim();
  if (userText) {
    input.value = "";
    nextStep(userText);
  }
});

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const userText = input.value.trim();
    if (userText) {
      input.value = "";
      nextStep(userText);
    }
  }
});

window.addEventListener("load", () => {
  nextStep(); 
});
