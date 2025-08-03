// Script da equipe com integração Discord
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script da equipe carregado');
    
    const equipeBtn = document.getElementById('equipeBtn');
    const equipeModal = document.getElementById('equipeModal');
    const closeBtn = document.getElementById('closeEquipeModal');
    
    console.log('Elementos:', {equipeBtn, equipeModal, closeBtn});
    
    // Configuração do Discord
    const DISCORD_CONFIG = {
        guildId: '1234567890123456789', // ID do seu servidor Discord
        botToken: 'YOUR_BOT_TOKEN_HERE', // Token do bot (será configurado no backend)
        apiUrl: 'https://policiamilitarnovacapital.onrender.com/api/discord/members'
    };
    
    // Abrir modal
    if (equipeBtn) {
        equipeBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('Botão Equipe clicado!');
            
            if (equipeModal) {
                equipeModal.style.display = 'block';
                equipeModal.style.zIndex = '9999';
                document.body.style.overflow = 'hidden';
                console.log('Modal aberto');
                
                // Carregar membros do Discord
                await carregarMembrosDiscord();
            }
        });
    }
    
    // Fechar modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            console.log('Fechando modal');
            equipeModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Fechar clicando fora
    if (equipeModal) {
        equipeModal.addEventListener('click', function(e) {
            if (e.target === equipeModal) {
                console.log('Fechando modal (clique fora)');
                equipeModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && equipeModal && equipeModal.style.display === 'block') {
            console.log('Fechando modal (ESC)');
            equipeModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Função para carregar membros do Discord
    async function carregarMembrosDiscord() {
        try {
            console.log('Carregando membros do Discord...');
            
            // Mostrar loading
            mostrarLoading();
            
            // Tentar buscar do servidor
            const response = await fetch(DISCORD_CONFIG.apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const membros = await response.json();
                console.log('Membros carregados:', membros);
                renderizarMembrosDiscord(membros);
            } else {
                console.log('Erro ao carregar membros do servidor, usando dados padrão');
                renderizarMembrosPadrao();
            }
            
        } catch (error) {
            console.error('Erro ao carregar membros:', error);
            renderizarMembrosPadrao();
        }
    }
    
    // Função para mostrar loading
    function mostrarLoading() {
        const equipeContainer = document.querySelector('.equipe-container');
        if (equipeContainer) {
            equipeContainer.innerHTML = `
                <div class="loading-equipe">
                    <div class="loading-spinner"></div>
                    <p>Carregando membros da equipe...</p>
                </div>
            `;
        }
    }
    
    // Função para renderizar membros do Discord
    function renderizarMembrosDiscord(membros) {
        const equipeContainer = document.querySelector('.equipe-container');
        if (!equipeContainer) return;
        
        if (membros.length === 0) {
            equipeContainer.innerHTML = `
                <div class="no-members">
                    <div class="no-members-icon">👥</div>
                    <h3>Nenhum membro online</h3>
                    <p>Nossa equipe está offline no momento.</p>
                </div>
            `;
            return;
        }
        
        const membrosHTML = membros.map(membro => `
            <div class="membro-equipe discord-member">
                <div class="avatar">
                    <img src="${membro.avatar || '../assets/default-avatar.png'}" 
                         alt="${membro.username}" 
                         class="avatar-img"
                         onerror="this.src='../assets/default-avatar.png'">
                    <div class="status-indicator ${membro.status || 'offline'}"></div>
                </div>
                <div class="membro-info">
                    <h3>${membro.username}</h3>
                    <p class="membro-cargo">${membro.roles ? membro.roles.join(', ') : 'Membro'}</p>
                    <p class="membro-status">${membro.status === 'online' ? '🟢 Online' : '⚫ Offline'}</p>
                </div>
            </div>
        `).join('');
        
        equipeContainer.innerHTML = `
            <div class="discord-header">
                <h3>🎮 Servidor Discord</h3>
                <p>${membros.length} membro(s) online</p>
            </div>
            <div class="equipe-grid">
                ${membrosHTML}
            </div>
        `;
    }
    
    // Função para renderizar membros padrão (fallback)
    function renderizarMembrosPadrao() {
        const equipeContainer = document.querySelector('.equipe-container');
        if (!equipeContainer) return;
        
        equipeContainer.innerHTML = `
            <div class="equipe-grid">
                <div class="membro-equipe">
                    <div class="avatar">
                        <span class="avatar-icon">👨‍💼</span>
                    </div>
                    <div class="membro-info">
                        <h3>Comandante Silva</h3>
                        <p>Comandante Geral</p>
                    </div>
                </div>
                <div class="membro-equipe">
                    <div class="avatar">
                        <span class="avatar-icon">👩‍💼</span>
                    </div>
                    <div class="membro-info">
                        <h3>Tenente Santos</h3>
                        <p>Ouvidora</p>
                    </div>
                </div>
                <div class="membro-equipe">
                    <div class="avatar">
                        <span class="avatar-icon">👨‍🔧</span>
                    </div>
                    <div class="membro-info">
                        <h3>Sargento Costa</h3>
                        <p>Coordenador Técnico</p>
                    </div>
                </div>
                <div class="membro-equipe">
                    <div class="avatar">
                        <span class="avatar-icon">👩‍💻</span>
                    </div>
                    <div class="membro-info">
                        <h3>Cabo Oliveira</h3>
                        <p>Suporte Técnico</p>
                    </div>
                </div>
                <div class="membro-equipe">
                    <div class="avatar">
                        <span class="avatar-icon">👨‍🚔</span>
                    </div>
                    <div class="membro-info">
                        <h3>Soldado Pereira</h3>
                        <p>Patrulheiro</p>
                    </div>
                </div>
                <div class="membro-equipe">
                    <div class="avatar">
                        <span class="avatar-icon">👩‍⚖️</span>
                    </div>
                    <div class="membro-info">
                        <h3>Delegada Lima</h3>
                        <p>Assessora Jurídica</p>
                    </div>
                </div>
            </div>
        `;
    }
}); 