
(function() {
    emailjs.init("j5NUxYV1wKXAIsRuI");
})();

const form = document.getElementById('denunciaForm');
const nomeInput = document.getElementById("nome");
const rgInput = document.getElementById("rg");
const youtubeInput = document.getElementById("linkYoutube");
const descricaoInput = document.getElementById("descricao");
const tipoSelect = document.getElementById("tipo");
const submitBtn = form.querySelector("button[type='submit']");

document.getElementById('showFormButton').addEventListener('click', function() {
    form.classList.add('show');
    this.style.display = 'none';
});

function validarCampos() {
    let valido = true;
    const nomeValido = nomeInput.value.trim() === "" || /^[A-Za-zÀ-ú\s]*$/.test(nomeInput.value);
    nomeInput.style.borderColor = nomeValido ? "green" : "red";
    if (!nomeValido) valido = false;
    const linkValido = youtubeInput.value.startsWith("https://youtu.be/");
    youtubeInput.style.borderColor = linkValido ? "green" : "red";
    if (!linkValido) valido = false;
    const descricaoValida = descricaoInput.value.trim().length >= 15;
    descricaoInput.style.borderColor = descricaoValida ? "green" : "red";
    if (!descricaoValida) valido = false;
    submitBtn.disabled = !valido;
}
[nomeInput, youtubeInput, descricaoInput].forEach(el => {
    el.addEventListener("input", validarCampos);
});

form.addEventListener("submit", async function(event) {
    event.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Enviando... <span class="form-spinner"></span>';
    await new Promise(res => setTimeout(res, 3500));
    const data = {
        nome: nomeInput.value,
        rg: rgInput.value,
        tipo: tipoSelect.value,
        descricao: descricaoInput.value,
        youtube: youtubeInput.value
    };
    const resumo = `Confirme os dados antes de enviar:\n\n` +
                   `🗾 Tipo: ${tipoSelect.value.toUpperCase()}\n` +
                   `📃 Descrição: ${descricaoInput.value}\n` +
                   `📺 Link YouTube: ${youtubeInput.value}`;
    if (!confirm(resumo)) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Enviar';
        return;
    }
    try {
        const resp = await fetch('https://policiamilitarnovacapital-production.up.railway.app/api/denuncias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!resp.ok) throw new Error('Erro ao enviar denúncia');
        const result = await resp.json();
        alert(`✅ Sua solicitação foi enviada com sucesso!\n\nSeu protocolo: ${result.protocolo}\nGuarde este número para acompanhar sua denúncia.`);
        exibirProtocoloNaTela(result.protocolo);
        form.reset();
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Enviar';
        form.classList.remove('show');
        document.getElementById('showFormButton').style.display = 'inline-block';
    } catch (err) {
        alert('❌ Ocorreu um erro ao enviar. Tente novamente.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Enviar';
    }
});

function exibirProtocoloNaTela(protocolo) {
    let div = document.getElementById('protocoloGerado');
    if (!div) {
        div = document.createElement('div');
        div.id = 'protocoloGerado';
        div.style.margin = '20px auto';
        div.style.maxWidth = '600px';
        div.style.background = '#e8f4ff';
        div.style.border = '1.5px solid #004b87';
        div.style.borderRadius = '8px';
        div.style.padding = '16px';
        div.style.fontWeight = 'bold';
        div.style.color = '#004b87';
        div.style.textAlign = 'center';
        form.parentNode.insertBefore(div, form.nextSibling);
    }
    div.innerHTML = `Seu protocolo: <span style='font-family:monospace;'>${protocolo}</span><br><small>Guarde este número para acompanhar sua denúncia.</small>`;
}

const text = "Nosso objetivo é garantir que suas denúncias, sugestões e elogios sejam ouvidos e tratados com seriedade. Sua voz é fundamental para a melhoria contínua da segurança pública.";
const typedText = document.getElementById("typed-text");
let index = 0;
function typeEffect() {
    if (index < text.length) {
        typedText.innerHTML += text.charAt(index);
        index++;
        setTimeout(typeEffect, 35);
    }
}
document.addEventListener("DOMContentLoaded", typeEffect);

function iniciarCarrossel() {
    const track = document.querySelector(".carousel-track");
    const slides = track.children;
    const total = slides.length;
    let current = 0;
    let slideWidth = slides[0].getBoundingClientRect().width;
    function updateSlideWidth() {
        slideWidth = slides[0].getBoundingClientRect().width;
    }
    window.addEventListener('resize', () => {
        updateSlideWidth();
        track.style.transition = "none";
        track.style.transform = `translateX(${-current * slideWidth}px)`;
    });
    setInterval(() => {
        updateSlideWidth();
        current++;
        if (current > total) {
            track.style.transition = "none";
            track.style.transform = `translateX(0px)`;
            current = 1;
            void track.offsetWidth;
            track.style.transition = "transform 0.5s ease-in-out";
            track.style.transform = `translateX(${-current * slideWidth}px)`;
        } else if (current === total) {
            const firstClone = slides[0].cloneNode(true);
            track.appendChild(firstClone);
            track.style.transition = "transform 0.5s ease-in-out";
            track.style.transform = `translateX(${-current * slideWidth}px)`;
            track.addEventListener("transitionend", function reset() {
                track.style.transition = "none";
                track.style.transform = `translateX(0px)`;
                current = 0;
                track.removeChild(firstClone);
                track.removeEventListener("transitionend", reset);
            });
        } else {
            track.style.transition = "transform 0.5s ease-in-out";
            track.style.transform = `translateX(${-current * slideWidth}px)`;
        }
    }, 4000);
}
document.addEventListener("DOMContentLoaded", iniciarCarrossel);

function setTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.textContent = isDark ? '☀️ Tema Claro' : '🌙 Tema Escuro';
    }
}
function loadTheme() {
    const saved = localStorage.getItem('theme');
    setTheme(saved === 'dark');
}
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.addEventListener('click', function() {
            const isDark = !document.body.classList.contains('dark-mode');
            setTheme(isDark);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const formAcompanhar = document.getElementById('acompanharForm');
    const statusDiv = document.getElementById('statusProtocolo');
    if (formAcompanhar && statusDiv) {
        formAcompanhar.addEventListener('submit', async function(e) {
            e.preventDefault();
            const protocolo = document.getElementById('protocolo').value.trim();
            try {
                const resp = await fetch(`https://policiamilitarnovacapital-production.up.railway.app/api/denuncias/${protocolo}`);
                if (!resp.ok) throw new Error('Protocolo não encontrado');
                const denuncia = await resp.json();
                let html = `Status: <b>${denuncia.status}</b><br>Tipo: ${denuncia.tipo}`;
                if (denuncia.status === 'Finalizada') {
                    html += `<br><span style='color:#008000;font-weight:bold;'>O policial será punido</span>`;
                }
                statusDiv.innerHTML = html;
            } catch {
                statusDiv.innerHTML = 'Protocolo não encontrado. Verifique o número digitado.';
            }
        });
    }
});



