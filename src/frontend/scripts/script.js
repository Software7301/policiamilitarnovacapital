/**
 * Script principal da Ouvidoria da Polícia Militar
 * Gerencia funcionalidades da página inicial e navegação
 */

// Inicialização do EmailJS
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
    const welcomeSubtitle = document.querySelector('.welcome-subtitle');
    const welcomeContent = document.querySelector('.welcome-content');
    const motto = document.querySelector('.motto');
    
    // Função de máquina de escrever
    function typeWriter(element, text, speed = 50, callback = null) {
        let index = 0;
        element.innerHTML = '';
        
        // Mostrar cursor
        element.style.borderRight = '2px solid #fff';
        
        function type() {
            if (index < text.length) {
                element.innerHTML += text.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                // Esconder cursor quando terminar
                element.style.borderRight = 'none';
                if (callback) callback();
            }
        }
        
        type();
    }
    
    // Função para iniciar animações
    function startAnimations() {
        if (welcomeSubtitle) {
            typeWriter(welcomeSubtitle, 'Bem-vindo à Ouvidoria da Polícia Militar da Nova Capital', 50, () => {
                if (welcomeContent) {
                    setTimeout(() => {
                        typeWriter(welcomeContent, 'Aqui você pode fazer denúncias, elogios e sugestões de forma segura e anônima. Nossa missão é melhorar continuamente nossos serviços para a comunidade.', 30);
                    }, 1000);
                }
            });
        }
        
        if (motto) {
            setTimeout(() => {
                typeWriter(motto, 'Servindo e Protegendo a Nova Capital', 60);
            }, 3000);
        }
    }
    
    // Iniciar animações quando a página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAnimations);
    } else {
        startAnimations();
    }
}

// Funcionalidades gerais
document.addEventListener('DOMContentLoaded', function() {
    // Navegação ativa
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Smooth scroll para links internos
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Animações de scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos para animação
    const animateElements = document.querySelectorAll('.card, .stat-item, .noticia-card');
    animateElements.forEach(el => observer.observe(el));
});

// Funções de tema (se necessário)
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

// Carregar tema ao iniciar
loadTheme();



