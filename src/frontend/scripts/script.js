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

// Animações e interatividade
class InteractiveUI {
    constructor() {
        this.init();
    }

    init() {
        this.addScrollAnimations();
        this.addHoverEffects();
        this.addRippleEffects();
        this.addParallaxEffects();
        this.addLoadingStates();
        this.addMobileOptimizations();
        this.addKeyboardNavigation();
        this.addTouchGestures();
    }

    // Animações de scroll
    addScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.style.animationDelay = `${Math.random() * 0.5}s`;
                }
            });
        }, observerOptions);

        // Observar elementos com animação
        document.querySelectorAll('.scroll-animate, .pmesp-card, .nav-item').forEach(el => {
            observer.observe(el);
        });
    }

    // Efeitos de hover
    addHoverEffects() {
        document.querySelectorAll('.interactive-element, .nav-item, .pmesp-card').forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                this.addHoverAnimation(e.target);
            });

            el.addEventListener('mouseleave', (e) => {
                this.removeHoverAnimation(e.target);
            });
        });
    }

    addHoverAnimation(element) {
        element.style.transform = 'scale(1.05) translateY(-2px)';
        element.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
    }

    removeHoverAnimation(element) {
        element.style.transform = '';
        element.style.boxShadow = '';
    }

    // Efeitos de ripple
    addRippleEffects() {
        document.querySelectorAll('.btn-animated, .nav-item').forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
        });
    }

    createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');

        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Efeitos de parallax
    addParallaxEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');

            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    // Estados de loading
    addLoadingStates() {
        document.querySelectorAll('button, .nav-item').forEach(element => {
            element.addEventListener('click', (e) => {
                this.addLoadingState(e.target);
            });
        });
    }

    addLoadingState(element) {
        if (element.classList.contains('loading')) return;

        const originalText = element.textContent;
        element.classList.add('loading');
        element.textContent = 'Carregando...';

        setTimeout(() => {
            element.classList.remove('loading');
            element.textContent = originalText;
        }, 2000);
    }

    // Otimizações para mobile
    addMobileOptimizations() {
        // Detectar touch
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });

        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        });

        // Adicionar classes para mobile
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile');
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                document.body.classList.add('mobile');
            } else {
                document.body.classList.remove('mobile');
            }
        });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up
                this.handleSwipeUp();
            } else {
                // Swipe down
                this.handleSwipeDown();
            }
        }
    }

    handleSwipeUp() {
        // Navegar para próxima seção
        const currentSection = this.getCurrentSection();
        const nextSection = currentSection.nextElementSibling;
        
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    handleSwipeDown() {
        // Navegar para seção anterior
        const currentSection = this.getCurrentSection();
        const prevSection = currentSection.previousElementSibling;
        
        if (prevSection) {
            prevSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    getCurrentSection() {
        const sections = document.querySelectorAll('section, .pmesp-card');
        let currentSection = sections[0];

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                currentSection = section;
            }
        });

        return currentSection;
    }

    // Navegação por teclado
    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateUp();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateDown();
                    break;
                case 'Enter':
                    this.activateCurrentElement();
                    break;
                case 'Escape':
                    this.closeModals();
                    break;
            }
        });
    }

    navigateUp() {
        const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        focusableElements[prevIndex].focus();
    }

    navigateDown() {
        const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        focusableElements[nextIndex].focus();
    }

    activateCurrentElement() {
        if (document.activeElement && document.activeElement.click) {
            document.activeElement.click();
        }
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }

    // Gestos de touch
    addTouchGestures() {
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;

            const diffX = startX - e.touches[0].clientX;
            const diffY = startY - e.touches[0].clientY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Swipe horizontal
                if (diffX > 0) {
                    // Swipe left
                    this.handleSwipeLeft();
                } else {
                    // Swipe right
                    this.handleSwipeRight();
                }
            }
        });

        document.addEventListener('touchend', () => {
            startX = 0;
            startY = 0;
        });
    }

    handleSwipeLeft() {
        // Navegar para próxima página
        const currentPage = this.getCurrentPage();
        const nextPage = this.getNextPage(currentPage);
        
        if (nextPage) {
            window.location.href = nextPage;
        }
    }

    handleSwipeRight() {
        // Navegar para página anterior
        const currentPage = this.getCurrentPage();
        const prevPage = this.getPrevPage(currentPage);
        
        if (prevPage) {
            window.location.href = prevPage;
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('denunciar.html')) return 'denunciar';
        if (path.includes('noticias.html')) return 'noticias';
        return 'index';
    }

    getNextPage(currentPage) {
        const pages = {
            'index': 'denunciar.html',
            'denunciar': 'noticias.html',
            'noticias': 'index.html'
        };
        return pages[currentPage];
    }

    getPrevPage(currentPage) {
        const pages = {
            'index': 'noticias.html',
            'denunciar': 'index.html',
            'noticias': 'denunciar.html'
        };
        return pages[currentPage];
    }
}

// Inicializar UI interativa
const interactiveUI = new InteractiveUI();

// Funcionalidade do campo de pesquisa no footer - Versão super interativa
document.addEventListener('DOMContentLoaded', function() {
    const footerSearch = document.getElementById('footerSearch');
    const footerSearchBtn = document.getElementById('footerSearchBtn');
    
    if (footerSearch && footerSearchBtn) {
        // Função para realizar a pesquisa
        function performSearch() {
            const searchTerm = footerSearch.value.trim();
            if (searchTerm) {
                // Adicionar efeito de loading
                footerSearchBtn.classList.add('loading');
                
                // Verificar se é um protocolo (4 dígitos)
                if (/^\d{4}$/.test(searchTerm)) {
                    // Redirecionar para a página de acompanhamento com o protocolo
                    setTimeout(() => {
                        window.location.href = `denunciar.html?protocolo=${searchTerm}`;
                    }, 500);
                } else {
                    // Pesquisa geral - pode redirecionar para notícias ou mostrar resultados
                    setTimeout(() => {
                        window.location.href = `noticias.html?search=${encodeURIComponent(searchTerm)}`;
                    }, 500);
                }
            }
        }
        
        // Função para adicionar efeito de ripple
        function addRippleEffect(element, event) {
            const ripple = document.createElement('span');
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');
            
            element.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
        
        // Event listeners
        footerSearchBtn.addEventListener('click', function(e) {
            addRippleEffect(this, e);
            performSearch();
        });
        
        footerSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Efeito de foco no input
        footerSearch.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
            this.style.transform = 'scale(1.02)';
        });
        
        footerSearch.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            this.style.transform = '';
        });
        
        // Animação de placeholder
        footerSearch.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.classList.add('has-content');
            } else {
                this.classList.remove('has-content');
            }
        });
        
        // Efeitos de hover para o botão de pesquisa
        footerSearchBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) translateY(-2px)';
        });
        
        footerSearchBtn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
        
        // Efeitos de ripple para botões de navegação
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                addRippleEffect(this, e);
            });
        });
        
        // Animação de entrada para o footer
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.opacity = '0';
            bottomNav.style.transform = 'translateY(100%)';
            
            setTimeout(() => {
                bottomNav.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                bottomNav.style.opacity = '1';
                bottomNav.style.transform = 'translateY(0)';
            }, 300);
        }
    }
});

if (isDenunciaPage) {
    // Elementos específicos da página de denúncia
    form = document.getElementById('denunciaForm');
    formLoading = document.getElementById('formLoading');
    formSuccess = document.getElementById('formSuccess');
    protocoloNumero = document.getElementById('protocoloNumero');
    
    // Validação de campos com animações
    function validarCampos() {
        const campos = ['rg', 'tipo', 'descricao'];
        let isValid = true;

        campos.forEach(campo => {
            const element = document.getElementById(campo);
            const value = element.value;

            if (!value) {
                element.classList.add('error');
                element.style.animation = 'shake 0.5s ease-in-out';
                isValid = false;
            } else {
                element.classList.remove('error');
                element.style.animation = 'success 0.3s ease-in-out';
            }
        });

        return isValid;
    }
    
    // Event listener para o formulário com animações
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validarCampos()) {
                return;
            }
            
            // Animar transição
            form.style.animation = 'fadeOut 0.3s ease-out';
            
            setTimeout(() => {
                form.style.display = 'none';
                formLoading.style.display = 'block';
                formLoading.style.animation = 'fadeIn 0.3s ease-out';
            }, 300);
            
            setTimeout(() => {
                formLoading.style.animation = 'fadeOut 0.3s ease-out';
                
                setTimeout(() => {
                    formLoading.style.display = 'none';
                    formSuccess.style.display = 'block';
                    formSuccess.style.animation = 'fadeIn 0.3s ease-out';
                    
                    // Gerar número de protocolo com animação
                    const protocolo = Math.floor(Math.random() * 9000) + 1000;
                    protocoloNumero.textContent = '';
                    
                    let i = 0;
                    const interval = setInterval(() => {
                        protocoloNumero.textContent += protocolo.toString()[i];
                        i++;
                        
                        if (i >= protocolo.toString().length) {
                            clearInterval(interval);
                            protocoloNumero.style.animation = 'pulse 1s ease-in-out';
                        }
                    }, 100);
                }, 300);
            }, 2000);
        });
    }
    
    // Formulário de acompanhamento com animações
    const acompanharForm = document.getElementById('acompanharForm');
    const statusProtocolo = document.getElementById('statusProtocolo');
    
    if (acompanharForm) {
        acompanharForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const protocolo = document.getElementById('protocolo').value;
            
            if (!protocolo) {
                const input = document.getElementById('protocolo');
                input.classList.add('error');
                input.style.animation = 'shake 0.5s ease-in-out';
                return;
            }
            
            // Animar consulta
            statusProtocolo.style.animation = 'loading 1s ease-in-out';
            statusProtocolo.innerHTML = '<div class="loading-spinner"></div>';
            
            setTimeout(() => {
                // Simular consulta
                const statuses = [
                    'Em análise',
                    'Em andamento',
                    'Concluído',
                    'Arquivado'
                ];
                
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                
                statusProtocolo.style.animation = 'fadeIn 0.5s ease-out';
                statusProtocolo.innerHTML = `
                    <div class="status-info">
                        <strong>Protocolo ${protocolo}</strong><br>
                        Status: <span class="status-${randomStatus.toLowerCase().replace(' ', '-')}">${randomStatus}</span>
                    </div>
                `;
            }, 1000);
        });
    }
} else {
    // Funcionalidades para a página principal com animações
    const welcomeSubtitle = document.querySelector('.welcome-subtitle');
    const welcomeContent = document.querySelector('.welcome-content');
    const motto = document.querySelector('.motto');
    
    // Definir conteúdo padrão se não existir
    if (welcomeSubtitle && !welcomeSubtitle.textContent) {
        welcomeSubtitle.textContent = 'Sistema de Ouvidoria Interativo';
    }
    
    if (welcomeContent && !welcomeContent.innerHTML) {
        welcomeContent.innerHTML = `
            <div class="features-list">
                <li><strong>Denúncias:</strong> Registre ocorrências de forma segura</li>
                <li><strong>Acompanhamento:</strong> Acompanhe o status em tempo real</li>
                <li><strong>Transparência:</strong> Sistema totalmente transparente</li>
                <li><strong>Segurança:</strong> Dados protegidos e sigilosos</li>
            </div>
        `;
    }
    
    if (motto && !motto.textContent) {
        motto.textContent = 'Servindo e Protegendo com Excelência';
    }
    
    // Função typeWriter melhorada com animações
    function typeWriter(element, text, speed = 50) {
        if (!element) return;
        
        element.textContent = '';
        element.style.animation = 'fadeIn 0.5s ease-out';
        
        let i = 0;
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                element.style.animation = 'pulse 1s ease-in-out';
            }
        }
        type();
    }
    
    // Função typeWriter com callback
    function typeWriter(element, text, speed = 50, callback = null) {
        if (!element) return;
        
        element.textContent = '';
        let i = 0;
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                if (callback) callback();
            }
        }
        type();
    }
    
    // Iniciar animações quando a página carregar
    function startAnimations() {
        const welcomeTitle = document.querySelector('.welcome-title');
        const welcomeSubtitle = document.querySelector('.welcome-subtitle');
        const welcomeContent = document.querySelector('.welcome-content');
        const motto = document.querySelector('.motto');
        
        // Animar elementos sequencialmente
        if (welcomeTitle) {
            typeWriter(welcomeTitle, 'Bem Vindo ao Site da Nova Capital', 50, () => {
                if (welcomeSubtitle) {
                    setTimeout(() => {
                        typeWriter(welcomeSubtitle, 'Sistema de Ouvidoria Interativo', 30, () => {
                            if (welcomeContent) {
                                setTimeout(() => {
                                    welcomeContent.style.animation = 'slideInUp 0.8s ease-out';
                                }, 500);
                            }
                        });
                    }, 500);
                }
            });
        }
        
        // Animar motto com efeito flutuante
        if (motto) {
            setTimeout(() => {
                motto.style.animation = 'floating 3s ease-in-out infinite';
            }, 2000);
        }
        
        // Animar cards com delay
        const cards = document.querySelectorAll('.pmesp-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'fadeInUp 0.8s ease-out';
            }, index * 200);
        });
        
        // Animar navegação
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = 'slideInUp 0.6s ease-out';
            }, 1000 + (index * 100));
        });
    }
    
    // Iniciar animações quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAnimations);
    } else {
        startAnimations();
    }
}

// Funções de tema
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

// Adicionar CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    
    @keyframes slideInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes success {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes loading {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .error {
        border-color: #ff4444 !important;
        box-shadow: 0 0 10px rgba(255, 68, 68, 0.3) !important;
    }
    
    .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #3498db;
        border-radius: 50%;
        animation: loading 1s linear infinite;
        margin: 0 auto;
    }
    
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .mobile .nav-item {
        padding: 15px;
        margin: 5px;
    }
    
    .mobile .pmesp-card {
        margin: 10px;
        padding: 20px;
    }
`;

document.head.appendChild(style);



