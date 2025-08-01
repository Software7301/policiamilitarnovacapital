
(function() {
    emailjs.init("j5NUxYV1wKXAIsRuI");
})();

// Verificar se estamos na página de denúncia
const isDenunciaPage = window.location.pathname.includes('denunciar.html');

// Elementos do formulário
let form, formLoading, formSuccess, protocoloNumero;

if (isDenunciaPage) {
    // Elementos específicos da página de denúncia
    form = document.getElementById('denunciaForm');
    formLoading = document.getElementById('formLoading');
    formSuccess = document.getElementById('formSuccess');
    protocoloNumero = document.getElementById('protocoloNumero');
    
    // Validação de campos
function validarCampos() {
        const rg = document.getElementById('rg').value;
        const tipo = document.getElementById('tipo').value;
        const descricao = document.getElementById('descricao').value;
        
        if (!rg || !tipo || !descricao) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return false;
        }
        return true;
    }
    
    // Event listener para o formulário
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validarCampos()) {
        return;
    }
            
            // Simular envio
            form.style.display = 'none';
            formLoading.style.display = 'block';
            
            setTimeout(() => {
                formLoading.style.display = 'none';
                formSuccess.style.display = 'block';
                
                // Gerar número de protocolo
                const protocolo = Math.floor(Math.random() * 9000) + 1000;
                protocoloNumero.textContent = protocolo;
            }, 2000);
        });
    }
    
    // Formulário de acompanhamento
    const acompanharForm = document.getElementById('acompanharForm');
    const statusProtocolo = document.getElementById('statusProtocolo');
    
    if (acompanharForm) {
        acompanharForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const protocolo = document.getElementById('protocolo').value;
            
            if (!protocolo) {
                alert('Por favor, digite o número do protocolo.');
                return;
            }
            
            // Simular consulta
            const statuses = [
                'Em análise',
                'Em andamento',
                'Concluído',
                'Arquivado'
            ];
            
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            statusProtocolo.innerHTML = `
                <div class="status-info">
                    <strong>Protocolo ${protocolo}</strong><br>
                    Status: <span class="status-${randomStatus.toLowerCase().replace(' ', '-')}">${randomStatus}</span>
                </div>
            `;
        });
    }
} else {
    // Funcionalidades para a página principal
    const typedText = document.getElementById('typed-text');
    
    if (typedText) {
        const text = "Sua voz é importante para nós. Faça sua denúncia de forma segura e confidencial.";
let index = 0;
        
        function typeWriter() {
    if (index < text.length) {
        typedText.innerHTML += text.charAt(index);
        index++;
                setTimeout(typeWriter, 50);
            }
        }
        
        // Iniciar a animação quando a página carregar
        window.addEventListener('load', typeWriter);
    }
}

// Funcionalidades globais
document.addEventListener('DOMContentLoaded', function() {
    // Menu toggle para mobile
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Player de galeria (simulado)
    const playBtn = document.querySelector('.play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            // Simular reprodução das imagens
            alert('Galeria de imagens da PM - Funcionalidade em desenvolvimento');
        });
    }
    

    
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                // Simular busca
                alert('Funcionalidade de busca em desenvolvimento');
            }
        });
    }
    
    // Bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const text = this.querySelector('.nav-text').textContent;
            
            switch(text) {
                case 'Início':
                    // Mostra a seção de atuação e esconde a de denúncia
                    const atuacaoSection = document.getElementById('atuacao-section');
                    const denunciaSection = document.getElementById('denuncia-section');
                    if (atuacaoSection && denunciaSection) {
                        atuacaoSection.style.display = 'block';
                        denunciaSection.style.display = 'none';
                    } else {
                        window.location.href = 'index.html';
                    }
                    break;
                case 'Denunciar':
                    // Redireciona para o formulário independente
                    window.location.href = 'formulario/index.html';
                    break;
                case 'Notícias':
                    window.location.href = 'noticias.html';
                    break;
                case 'Painel Admin':
                    window.open('admin/admin.html', '_blank');
                    break;
            }
        });
    });
    
    // Login button
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            window.open('admin/admin.html', '_blank');
        });
    }
    

});

// Tema escuro/claro (mantido para compatibilidade)
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

// Carregar tema ao inicializar
loadTheme();



