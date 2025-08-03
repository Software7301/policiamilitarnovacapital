// ========================================
// CONFIGURAÇÃO AUTOMÁTICA DO IMGBB
// ========================================
// A chave da API do ImgBB está configurada automaticamente
// Não é necessário configurar manualmente
// Chave: f1c5a9553acee05b8acf2ee0e5d5dc56
// ========================================

let currentUser = null;
let autoRefreshInterval;
let lastDenunciasCount = 0;
window.noticiaFotos = [];

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando...');
    
    // Carregar Google Sign-In
    loadGoogleSignIn();
    
    // Verificar status de autenticação
    checkAuthStatus();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar dados iniciais
    carregarDenuncias();
    carregarNoticias();
    
    // Iniciar verificação automática de novas denúncias
    iniciarVerificacaoAutomatica();
});

function checkAuthStatus() {
    const savedAccount = localStorage.getItem('adminAccount');
    
    if (savedAccount) {
        const accountData = JSON.parse(savedAccount);
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn) {
            showDashboard();
        } else {
            showLogin();
        }
    } else {
        const savedUser = localStorage.getItem('adminUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showSetupAccount();
        } else {
            showLogin();
        }
    }
}

function setupEventListeners() {
    const manualLoginBtn = document.getElementById('manualLogin');
    if (manualLoginBtn) {
        manualLoginBtn.addEventListener('click', handleManualLogin);
    }
    
    const setupSubmitBtn = document.getElementById('setupSubmitBtn');
    if (setupSubmitBtn) {
        setupSubmitBtn.addEventListener('click', handleSetupAccount);
    }
    
    const setupLogoutBtn = document.getElementById('setupLogout');
    if (setupLogoutBtn) {
        setupLogoutBtn.addEventListener('click', handleLogout);
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Event listeners para verificação de senha Google
    const verifyPasswordBtn = document.getElementById('verifyPasswordBtn');
    if (verifyPasswordBtn) {
        verifyPasswordBtn.addEventListener('click', verifyGooglePassword);
    }
    
    const cancelGoogleBtn = document.getElementById('cancelGoogleBtn');
    if (cancelGoogleBtn) {
        cancelGoogleBtn.addEventListener('click', cancelGoogleLogin);
    }
    
    // Event listener para Enter na senha Google
    const googlePasswordInput = document.getElementById('googlePassword');
    if (googlePasswordInput) {
        googlePasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verifyGooglePassword();
            }
        });
    }
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    const refreshDenunciasBtn = document.getElementById('refreshDenuncias');
    if (refreshDenunciasBtn) {
        refreshDenunciasBtn.addEventListener('click', carregarDenuncias);
    }
    
    const searchProtocoloBtn = document.getElementById('searchProtocolo');
    if (searchProtocoloBtn) {
        searchProtocoloBtn.addEventListener('click', pesquisarProtocolo);
    }
    
    const closeSearchBtn = document.getElementById('closeSearch');
    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', fecharPesquisa);
    }
    

    const addNoticiaBtn = document.getElementById('addNoticia');
    if (addNoticiaBtn) {
        addNoticiaBtn.addEventListener('click', toggleNoticiaForm);
    }
    
    const closeNoticiaFormBtn = document.getElementById('closeNoticiaForm');
    if (closeNoticiaFormBtn) {
        closeNoticiaFormBtn.addEventListener('click', toggleNoticiaForm);
    }
    
    const cancelNoticiaBtn = document.getElementById('cancelNoticia');
    if (cancelNoticiaBtn) {
        cancelNoticiaBtn.addEventListener('click', toggleNoticiaForm);
    }
    
    const noticiaFormElement = document.getElementById('noticiaFormElement');
    if (noticiaFormElement) {
        noticiaFormElement.addEventListener('submit', handleNoticiaSubmit);
    }
    
    const deleteNoticiasBtn = document.getElementById('deleteNoticias');
    if (deleteNoticiasBtn) {
        deleteNoticiasBtn.addEventListener('click', handleDeleteNoticias);
    }
    
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', handleSaveSettings);
    }
    

    
    const setupAccountForm = document.getElementById('setupAccountForm');
    if (setupAccountForm) {
        setupAccountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSetupAccount();
        });
    }
    
    const telefoneInput = document.getElementById('setupTelefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatarTelefone);
    }
    
    const protocoloSearch = document.getElementById('protocoloSearch');
    if (protocoloSearch) {
        protocoloSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                pesquisarProtocolo();
            }
        });
    }
    
    // Setup file upload
    setupFileUpload();
}

function setupFileUpload() {
    const fileInput = document.getElementById('noticiaFotos');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    
    if (fileInput && fileUploadArea) {
        fileInput.addEventListener('change', handleFileSelect);
        
        fileUploadArea.addEventListener('click', () => fileInput.click());
        fileUploadArea.addEventListener('dragover', handleDragOver);
        fileUploadArea.addEventListener('drop', handleDrop);
    }
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    processFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#667eea';
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#ddd';
    
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
}

function processFiles(files) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        alert('Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF)');
        return;
    }
    
    if (imageFiles.length > 3) {
        alert('Máximo 3 fotos permitidas');
        return;
    }
    
    // Validar tamanho dos arquivos
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
        alert(`Os seguintes arquivos são muito grandes (máximo 5MB):\n${oversizedFiles.map(f => f.name).join('\n')}`);
        return;
    }
    
    window.noticiaFotos = [];
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    imagePreviewContainer.innerHTML = '';
    
    imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Otimizar a imagem antes de salvar
            optimizeImage(e.target.result, file.name, file.size, file.type, index);
        };
        
        reader.readAsDataURL(file);
    });
}

function optimizeImage(dataUrl, fileName, fileSize, fileType, index) {
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Definir tamanho máximo menor
        const maxWidth = 600;
        const maxHeight = 400;
        
        let { width, height } = img;
        
        // Redimensionar se necessário
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para base64 com qualidade mais baixa para reduzir tamanho
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        
        // Verificar se o tamanho ainda está muito grande
        const estimatedSize = Math.round(optimizedDataUrl.length * 0.75);
        const maxAllowedSize = 500 * 1024; // 500KB
        
        if (estimatedSize > maxAllowedSize) {
            // Tentar com qualidade ainda menor
            const ultraOptimizedDataUrl = canvas.toDataURL('image/jpeg', 0.4);
            const ultraOptimizedSize = Math.round(ultraOptimizedDataUrl.length * 0.75);
            
            if (ultraOptimizedSize > maxAllowedSize) {
                alert(`A imagem "${fileName}" ainda está muito grande após otimização. Tente uma imagem menor.`);
                return;
            }
            
            // Usar versão ultra otimizada
            const fileData = {
                name: fileName,
                size: fileSize,
                type: fileType,
                dataUrl: ultraOptimizedDataUrl,
                optimizedSize: ultraOptimizedSize
            };
            
            window.noticiaFotos.push(fileData);
            createImagePreview(ultraOptimizedDataUrl, fileName, ultraOptimizedSize, index);
        } else {
            const fileData = {
                name: fileName,
                size: fileSize,
                type: fileType,
                dataUrl: optimizedDataUrl,
                optimizedSize: estimatedSize
            };
            
            window.noticiaFotos.push(fileData);
            createImagePreview(optimizedDataUrl, fileName, estimatedSize, index);
        }
        
        console.log(`Imagem ${fileName} otimizada:`, {
            originalSize: fileSize,
            optimizedSize: estimatedSize,
            dimensions: `${width}x${height}`
        });
    };
    
    img.src = dataUrl;
}

function createImagePreview(dataUrl, fileName, optimizedSize, index) {
    const previewDiv = document.createElement('div');
    previewDiv.className = 'image-preview-item';
    previewDiv.innerHTML = `
        <img src="${dataUrl}" alt="${fileName}" class="preview-image">
        <div class="preview-info">
            <span>${fileName}</span>
            <small>${(optimizedSize / 1024).toFixed(1)} KB</small>
        </div>
        <button type="button" class="remove-image" onclick="removeImage(${index})">×</button>
    `;
    
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    imagePreviewContainer.appendChild(previewDiv);
}

function removeImage(index) {
    window.noticiaFotos.splice(index, 1);
    updateImagePreviews();
}

function updateImagePreviews() {
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    imagePreviewContainer.innerHTML = '';
    
    window.noticiaFotos.forEach((file, index) => {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'image-preview-item';
        previewDiv.innerHTML = `
            <img src="${file.dataUrl}" alt="${file.name}" class="preview-image">
            <div class="preview-info">
                <span>${file.name}</span>
                <small>${(file.size / 1024).toFixed(1)} KB</small>
            </div>
            <button type="button" class="remove-image" onclick="removeImage(${index})">×</button>
        `;
        
        imagePreviewContainer.appendChild(previewDiv);
    });
}

function formatarTelefone(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 3) {
        value = value.substring(0, 3) + ' - ' + value.substring(3);
    }
    event.target.value = value;
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('setupAccount').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showSetupAccount() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('setupAccount').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    
    if (currentUser) {
        document.getElementById('setupUserName').textContent = currentUser.name;
        document.getElementById('setupUserEmail').textContent = currentUser.email;
        document.getElementById('setupUserAvatar').src = currentUser.picture || 'assets/admin.png';
    }
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('setupAccount').style.display = 'none';
    document.getElementById('googlePasswordScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    
    // Carregar dados do usuário
    const adminName = localStorage.getItem('adminName');
    const adminEmail = localStorage.getItem('adminEmail');
    const adminDepartamento = localStorage.getItem('adminDepartamento');
    
    document.getElementById('adminName').textContent = adminName || 'Administrador';
    document.getElementById('adminEmail').textContent = adminEmail || 'Configure seu email';
    document.getElementById('adminDepartamento').textContent = adminDepartamento || 'Departamento';
    
    // Carregar dados iniciais
    carregarDenuncias();
    carregarNoticias();
}

function showGooglePasswordScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('setupAccount').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('googlePasswordScreen').style.display = 'flex';
    
    // Carregar dados do usuário Google
    const googleName = localStorage.getItem('tempGoogleName');
    const googleEmail = localStorage.getItem('tempGoogleEmail');
    const googlePicture = localStorage.getItem('tempGooglePicture');
    
    document.getElementById('googleUserName').textContent = googleName || 'Usuário Google';
    document.getElementById('googleUserEmail').textContent = googleEmail || 'google@exemplo.com';
    document.getElementById('googleUserAvatar').src = googlePicture || 'assets/admin.png';
    
    // Limpar campos
    document.getElementById('googlePassword').value = '';
    document.getElementById('passwordError').style.display = 'none';
}

function handleManualLogin() {
    const nome = document.getElementById('adminNome').value.trim();
    const senha = document.getElementById('adminPassword').value;
    
    if (!nome || !senha) {
        showLoginError('Preencha todos os campos');
        return;
    }
    
    // Verificar senha de 8 dígitos
    if (senha === '!)@(#*$&') {
        console.log('✅ Login manual bem-sucedido');
        
        showLoginSpinner();
        
        // Salvar dados do usuário com o nome digitado
        const userData = {
            name: nome,
            cargo: 'Administrador',
            telefone: '',
            departamento: 'Developer',
            senha: senha,
            email: '' // Email será configurado pelo usuário
        };
        
        localStorage.setItem('adminAccount', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('adminName', nome);
        localStorage.setItem('adminEmail', ''); // Email vazio inicialmente
        localStorage.setItem('adminDepartamento', userData.departamento);
        
        // Atualizar o nome no painel
        document.getElementById('adminName').textContent = nome;
        
        hideLoginSpinner();
        showDashboard();
    } else {
        showLoginError('Senha incorreta. Use: !)@(#*$&');
    }
}

function handleSetupAccount() {
    const nome = document.getElementById('setupNome').value.trim();
    const cargo = document.getElementById('setupCargo').value.trim();
    const telefone = document.getElementById('setupTelefone').value;
    const departamento = document.getElementById('setupDepartamento').value;
    const senha = document.getElementById('setupSenha').value;
    const confirmarSenha = document.getElementById('setupConfirmarSenha').value;
    
    if (!nome || !cargo || !departamento || !senha || !confirmarSenha) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }
    
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem');
        return;
    }
    
    if (senha.length < 8) {
        alert('A senha deve ter pelo menos 8 caracteres');
        return;
    }
    
    showSetupSpinner();
    
    const accountData = {
        name: nome,
        cargo: cargo,
        telefone: telefone,
        departamento: departamento,
        senha: senha,
        email: '' // Email será configurado pelo usuário
    };
    
    localStorage.setItem('adminAccount', JSON.stringify(accountData));
    localStorage.setItem('isLoggedIn', 'true');
    
    setTimeout(() => {
        hideSetupSpinner();
        showDashboard();
    }, 1000);
}

function handleLogout() {
        localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('adminUser');
        currentUser = null;
    pararAtualizacaoAutomatica();
        showLogin();
    }

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

function showLoginSpinner() {
    document.getElementById('loginSpinner').style.display = 'inline-block';
    document.querySelector('#manualLogin .btn-text').style.display = 'none';
}

function hideLoginSpinner() {
    document.getElementById('loginSpinner').style.display = 'none';
    document.querySelector('#manualLogin .btn-text').style.display = 'inline';
}

function showSetupSpinner() {
    document.getElementById('setupSpinner').style.display = 'inline-block';
    document.querySelector('#setupSubmitBtn .btn-text').style.display = 'none';
}

function hideSetupSpinner() {
    document.getElementById('setupSpinner').style.display = 'none';
    document.querySelector('#setupSubmitBtn .btn-text').style.display = 'inline';
}

function showLoginError(message) {
    const errorElement = document.getElementById('loginError');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}



function iniciarAtualizacaoAutomatica() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    autoRefreshInterval = setInterval(verificarNovasDenuncias, 5000);
}

function pararAtualizacaoAutomatica() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

async function verificarNovasDenuncias() {
    try {
        // Para desenvolvimento local, vamos pular a verificação
        console.log('Verificação automática desabilitada para desenvolvimento local');
        
        /*
        const url = 'https://policiamilitarnovacapital.onrender.com/api/denuncias';
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const todasDenuncias = await response.json();
        
        if (todasDenuncias.length !== lastDenunciasCount) {
            carregarDenuncias();
            mostrarNotificacaoNovaDenuncia();
        }
        */
        
    } catch (error) {
        console.log('Erro na verificação automática:', error.message);
    }
}

function mostrarNotificacaoNovaDenuncia() {
    const notificacao = document.createElement('div');
    notificacao.className = 'nova-denuncia-notificacao';
    notificacao.innerHTML = `
        <div class="notificacao-content">
            <div class="notificacao-icon">🆕</div>
            <div class="notificacao-texto">
                <strong>Nova denúncia recebida!</strong>
                <p>Uma nova denúncia foi adicionada ao sistema.</p>
            </div>
            <button class="notificacao-fechar" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        if (notificacao.parentElement) {
            notificacao.remove();
        }
    }, 5000);
}

async function pesquisarProtocolo() {
    const protocolo = document.getElementById('protocoloSearch').value.trim();
    
    if (!protocolo) {
        alert('Digite um número de protocolo para pesquisar');
        return;
    }
    
    try {
        const url = 'https://policiamilitarnovacapital.onrender.com/api/denuncias';
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const todasDenuncias = await response.json();
        const denunciaEncontrada = todasDenuncias.find(d => d.protocolo === protocolo);
        
        mostrarResultadoPesquisa(denunciaEncontrada, protocolo);
        
        } catch (error) {
        console.log('Erro ao pesquisar protocolo:', error.message);
        alert('Erro ao pesquisar protocolo');
    }
}

function mostrarResultadoPesquisa(denuncia, protocolo) {
    const searchResult = document.getElementById('searchResult');
    const searchResultContent = document.getElementById('searchResultContent');
    
    if (!denuncia) {
        searchResultContent.innerHTML = `
            <div class="no-result">
                <div class="no-result-icon">🔍</div>
                <h4>Protocolo não encontrado</h4>
                <p>Nenhuma denúncia encontrada com o protocolo <strong>${protocolo}</strong>.</p>
                <p>Verifique se o número está correto e tente novamente.</p>
            </div>
        `;
    } else {
        const isFinalizada = denuncia.status === 'Finalizada';
        searchResultContent.innerHTML = `
            <div class="search-result-card ${isFinalizada ? 'finalizada' : ''}">
                <div class="denuncia-header">
                    <span class="protocolo">Protocolo: ${denuncia.protocolo}</span>
                    <span class="status-badge status-${denuncia.status.toLowerCase().replace(' ', '-')}">${denuncia.status}</span>
                </div>
                <div class="search-result-info">
                    <p><strong>Nome:</strong> ${denuncia.nome}</p>
                    <p><strong>RG:</strong> ${denuncia.rg}</p>
                    <p><strong>Tipo:</strong> ${denuncia.tipo}</p>
                    <p><strong>Descrição:</strong> ${denuncia.descricao}</p>
                    ${denuncia.youtube ? `<p><strong>Link YouTube:</strong> <a href="${denuncia.youtube}" target="_blank" rel="noopener">🎥 Ver vídeo no YouTube</a></p>` : ''}
                    <p><strong>Data de Criação:</strong> ${new Date(denuncia.dataCriacao || Date.now()).toLocaleDateString()}</p>
                    ${isFinalizada ? `<p><strong>Data de Finalização:</strong> ${new Date(denuncia.dataFinalizacao || Date.now()).toLocaleDateString()}</p>` : ''}
                </div>
            </div>
        `;
    }
    
    searchResult.style.display = 'block';
    document.getElementById('protocoloSearch').value = '';
}

function fecharPesquisa() {
    document.getElementById('searchResult').style.display = 'none';
    document.getElementById('searchResultContent').innerHTML = '';
}

async function carregarDenuncias() {
    try {
        console.log('Carregando denúncias do servidor...');
        
        // Carregar APENAS do servidor
        const url = 'https://policiamilitarnovacapital.onrender.com/api/denuncias';
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Conectado ao servidor - carregando denúncias reais');
            const todasDenuncias = await response.json();
            window.denuncias = todasDenuncias;
            
            // Filtrar apenas denúncias ativas (não finalizadas)
            const denunciasAtivas = todasDenuncias.filter(d => d.status !== 'Finalizada');
            lastDenunciasCount = denunciasAtivas.length;
            
            renderizarDenuncias(denunciasAtivas);
        } else {
            console.log('❌ Erro ao conectar ao servidor:', response.status);
            renderizarDenuncias([]);
        }
    } catch (error) {
        console.log('❌ Erro de conexão com servidor:', error.message);
        renderizarDenuncias([]);
    }
}

function renderizarDenuncias(denuncias) {
    const container = document.getElementById('denunciasList');
    
    if (!container) {
        console.error('Container de denúncias não encontrado!');
        return;
    }
    
    container.innerHTML = '';
    
    if (denuncias.length === 0) {
        container.innerHTML = `
            <div class="no-result">
                <div class="no-result-icon">📋</div>
                <h4>Nenhuma denúncia ativa</h4>
                <p>Não há denúncias em análise no momento.</p>
                <p>Use a pesquisa para consultar denúncias finalizadas.</p>
            </div>
        `;
        return;
    }
    
    denuncias.forEach(denuncia => {
        const card = document.createElement('div');
        card.className = 'denuncia-card';
        card.innerHTML = `
            <div class="denuncia-header">
                <span class="protocolo">Protocolo: ${denuncia.protocolo}</span>
                <span class="status-badge status-${denuncia.status.toLowerCase().replace(' ', '-')}">${denuncia.status}</span>
            </div>
            <div class="denuncia-content">
                <p><strong>Nome:</strong> ${denuncia.nome}</p>
                <p><strong>RG:</strong> ${denuncia.rg}</p>
                <p><strong>Tipo:</strong> ${denuncia.tipo}</p>
                <p><strong>Descrição:</strong> ${denuncia.descricao}</p>
                ${denuncia.youtube ? `<p><strong>Link YouTube:</strong> <a href="${denuncia.youtube}" target="_blank" rel="noopener">🎥 Ver vídeo no YouTube</a></p>` : ''}
                </div>
            <div class="denuncia-actions">
                <select class="status-select" data-protocolo="${denuncia.protocolo}">
                    <option value="Em análise" ${denuncia.status === 'Em análise' ? 'selected' : ''}>Em análise</option>
                    <option value="Finalizada" ${denuncia.status === 'Finalizada' ? 'selected' : ''}>Finalizada</option>
                </select>
            </div>
        `;
        
        container.appendChild(card);
        
        const select = card.querySelector('.status-select');
        select.addEventListener('change', function(event) {
    const protocolo = event.target.dataset.protocolo;
    const novoStatus = event.target.value;
    
    if (novoStatus === 'Finalizada') {
                handleStatusChange(protocolo, novoStatus);
            }
        });
    });
}

async function handleStatusChange(protocolo, novoStatus) {
    try {
        console.log(`Alterando status do protocolo ${protocolo} para ${novoStatus}`);
        
        // Atualizar no servidor principal
        try {
            await atualizarStatusNoServidor(protocolo, novoStatus);
            console.log('✅ Status atualizado no servidor principal com sucesso!');
            
            // Se foi finalizada, mover para backend de finalizadas
            if (novoStatus === 'Finalizada') {
                try {
                    await moverParaFinalizadas(protocolo);
                    console.log('✅ Denúncia movida para backend de finalizadas!');
                } catch (finalizadasError) {
                    console.log('⚠️ Erro ao mover para finalizadas:', finalizadasError.message);
                }
                
                // Mostrar notificação
                mostrarNotificacaoDenunciaFinalizada(protocolo);
            }
            
            // Recarregar denúncias do servidor (vai filtrar as finalizadas)
            await carregarDenuncias();
            
        } catch (serverError) {
            console.log('❌ Erro ao atualizar no servidor:', serverError.message);
        }
        
    } catch (error) {
        console.error('Erro ao alterar status:', error);
    }
}

async function atualizarStatusNoServidor(protocolo, novoStatus) {
    const url = `https://policiamilitarnovacapital.onrender.com/api/denuncias/${protocolo}`;
    
    try {
        // Forçar cache busting
        const cacheBuster = new Date().getTime();
        const urlWithCache = `${url}?_t=${cacheBuster}`;
        
        const response = await fetch(urlWithCache, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                status: novoStatus,
                dataFinalizacao: novoStatus === 'Finalizada' ? new Date().toISOString() : null
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Status atualizado no servidor:', result);
        return result;
        
    } catch (error) {
        console.log('❌ Erro ao atualizar no servidor:', error.message);
        throw error;
    }
}

async function moverParaFinalizadas(protocolo) {
    try {
        // Primeiro, buscar os dados da denúncia no servidor principal
        const response = await fetch(`https://policiamilitarnovacapital.onrender.com/api/denuncias/${protocolo}`);
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar denúncia: ${response.status}`);
        }
        
        const denuncia = await response.json();
        
        // Preparar dados para enviar ao backend de finalizadas
        const dadosFinalizada = {
            protocolo: denuncia.protocolo,
            nome: denuncia.nome,
            rg: denuncia.rg,
            tipo: denuncia.tipo,
            descricao: denuncia.descricao,
            youtube: denuncia.youtube || '',
            data_criacao: denuncia.dataCriacao || new Date().toISOString(),
            data_finalizacao: new Date().toISOString(),
            observacoes: 'Movida automaticamente do painel admin'
        };
        
        // Tentar enviar para o backend de finalizadas (se estiver funcionando)
        try {
            const finalizadasResponse = await fetch('https://ouvidoria-finalizadas.onrender.com/api/finalizadas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dadosFinalizada)
            });
            
            if (finalizadasResponse.ok) {
                console.log('✅ Denúncia movida para finalizadas com sucesso!');
                return await finalizadasResponse.json();
            } else {
                console.log('⚠️ Backend de finalizadas não respondeu, continuando...');
            }
        } catch (finalizadasError) {
            console.log('⚠️ Backend de finalizadas não disponível:', finalizadasError.message);
        }
        
        // Se o backend de finalizadas não funcionar, usar o proxy do backend principal
        console.log('🔄 Usando proxy do backend principal...');
        const proxyResponse = await fetch('https://policiamilitarnovacapital.onrender.com/api/finalizadas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dadosFinalizada)
        });
        
        if (proxyResponse.ok) {
            console.log('✅ Denúncia movida via proxy com sucesso!');
            return await proxyResponse.json();
        } else {
            throw new Error(`Erro ao enviar via proxy: ${proxyResponse.status}`);
        }
        
    } catch (error) {
        console.log('❌ Erro ao mover para finalizadas:', error.message);
        throw error;
    }
}

function finalizarDenuncia(protocolo) {
    const card = document.querySelector(`[data-protocolo="${protocolo}"]`).closest('.denuncia-card');
    
    if (card) {
        card.classList.add('finalizando');
        
        setTimeout(() => {
            card.classList.add('removendo');
            
            setTimeout(() => {
                card.remove();
                mostrarNotificacaoDenunciaFinalizada(protocolo);
                
                const container = document.getElementById('denunciasList');
                if (container.children.length === 0) {
                    container.innerHTML = `
                        <div class="no-result">
                            <div class="no-result-icon">📋</div>
                            <h4>Nenhuma denúncia ativa</h4>
                            <p>Não há denúncias em análise no momento.</p>
                            <p>Use a pesquisa para consultar denúncias finalizadas.</p>
                        </div>
                    `;
                }
            }, 300);
        }, 500);
    }
}

function mostrarNotificacaoDenunciaFinalizada(protocolo) {
    const notificacao = document.createElement('div');
    notificacao.className = 'denuncia-finalizada-notificacao';
    notificacao.innerHTML = `
        <div class="notificacao-content">
            <div class="notificacao-icon">✅</div>
            <div class="notificacao-texto">
                <strong>Denúncia finalizada!</strong>
                <p>Protocolo ${protocolo} foi finalizado com sucesso.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notificacao);
    
                setTimeout(() => {
        if (notificacao.parentElement) {
            notificacao.remove();
        }
    }, 3000);
}

function toggleNoticiaForm() {
    const form = document.getElementById('noticiaFormOverlay');
    const isVisible = form.style.display !== 'none';
    
    form.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        document.getElementById('noticiaTitulo').value = '';
        document.getElementById('noticiaConteudo').value = '';
        document.getElementById('noticiaFotos').value = '';
        document.getElementById('imagePreviewContainer').innerHTML = '';
        window.noticiaFotos = [];
    }
}

async function handleNoticiaSubmit(event) {
    event.preventDefault();
    
    const titulo = document.getElementById('noticiaTitulo').value.trim();
    const conteudo = document.getElementById('noticiaConteudo').value.trim();
    
    if (!titulo || !conteudo) {
        alert('Por favor, preencha título e conteúdo.');
        return;
    }
    
    // Declarar fotosProcessadas no escopo correto
    let fotosProcessadas = [];
    
    const noticiaData = {
        titulo: titulo,
        conteudo: conteudo,
        data_publicacao: new Date().toISOString()
    };
    
    // Processar fotos se existirem
    if (window.noticiaFotos && window.noticiaFotos.length > 0) {
        try {
            // Verificar se ImgBB está configurado
            const imgbbConfigurado = await verificarConfiguracaoImgBB();
            
            // Criar backup das imagens
            criarBackupImagens(window.noticiaFotos);
            
            // Tentar diferentes formatos de envio
            if (imgbbConfigurado) {
                try {
                    fotosProcessadas = await processarImagensParaEnvio(window.noticiaFotos);
                    console.log('Fotos processadas com ImgBB:', fotosProcessadas);
                } catch (error) {
                    console.error('Erro no upload para ImgBB:', error);
                    console.log('Usando backup local...');
                    fotosProcessadas = processarImagensParaEnvioLocal(window.noticiaFotos);
                }
            } else {
                fotosProcessadas = processarImagensParaEnvioLocal(window.noticiaFotos);
            }
            
            // Converter para string se for array
            if (Array.isArray(fotosProcessadas)) {
                noticiaData.fotos = fotosProcessadas.join(',');
            } else {
                noticiaData.fotos = fotosProcessadas;
            }
            
            console.log('Fotos finais para envio:', noticiaData.fotos);
            console.log('Tentando com fotos...');
        } catch (error) {
            console.error('Erro ao processar fotos:', error);
            console.log('Tentando sem fotos...');
            noticiaData.fotos = null;
        }
    }
    
    // Mostrar loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Publicando...</span>';
    submitBtn.disabled = true;
    
    try {
        console.log('Iniciando publicação da notícia...');
        console.log('Título:', titulo);
        console.log('Conteúdo:', conteudo);
        console.log('Fotos:', window.noticiaFotos);
        
        const url = 'https://policiamilitarnovacapital.onrender.com/api/noticias';
        
        console.log('Dados da notícia:', noticiaData);
        
        // Criar controller de abort para timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(noticiaData),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorText = await response.text();
                console.log('Erro response:', errorText);
                errorMessage += `: ${errorText}`;
            } catch (e) {
                console.log('Não foi possível ler o erro do servidor');
            }
            throw new Error(errorMessage);
        }
        
        const novaNoticia = await response.json();
        console.log('Notícia criada:', novaNoticia);
        
        if (!window.noticias) {
            window.noticias = [];
        }
        
        window.noticias.push(novaNoticia);
        renderizarNoticias(window.noticias);
        toggleNoticiaForm();
        
        // Salvar estado das fotos antes de limpar
        const tinhaFotos = window.noticiaFotos && window.noticiaFotos.length > 0;
        
        // Limpar formulário
        document.getElementById('noticiaTitulo').value = '';
        document.getElementById('noticiaConteudo').value = '';
        document.getElementById('noticiaFotos').value = '';
        window.noticiaFotos = [];
        
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        if (imagePreviewContainer) {
            imagePreviewContainer.innerHTML = '';
        }
        
        const sucessoMsg = tinhaFotos ? 
            '✅ Notícia publicada com sucesso!\n\n📸 As fotos foram incluídas automaticamente.' : 
            '✅ Notícia publicada com sucesso!';
        
        // Recarregar notícias para mostrar a nova
        await carregarNoticias();
        
        alert(sucessoMsg);
        
    } catch (error) {
        console.error('Erro detalhado ao publicar notícia:', error);
        console.error('Stack trace:', error.stack);
        
        let errorMessage = 'Erro ao publicar notícia';
        
        if (error.name === 'AbortError') {
            errorMessage = 'Timeout: O servidor demorou muito para responder';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Erro de conexão: Verifique sua internet';
        } else if (error.message.includes('CORS')) {
            errorMessage = 'Erro de CORS: Problema de configuração do servidor';
        } else if (error.message.includes('500')) {
            errorMessage = 'Erro 500: Problema no servidor. Tente novamente em alguns minutos.';
        } else {
            errorMessage = error.message;
        }
        
        alert(errorMessage);
        
    } finally {
        // Restaurar botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function carregarNoticias() {
    try {
        const url = 'https://policiamilitarnovacapital.onrender.com/api/noticias';
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const responseData = await response.json();
        // Verificar se a resposta tem a propriedade 'noticias'
        const noticias = responseData.noticias || responseData || [];
        console.log('Dados de notícias recebidos:', noticias);
        window.noticias = noticias;
        
        renderizarNoticias(noticias);
        
    } catch (error) {
        console.log('Erro ao carregar notícias:', error.message);
        window.noticias = [];
        renderizarNoticias([]);
    }
}

function renderizarNoticias(noticias) {
    console.log('Renderizando notícias:', noticias);
    
    const container = document.getElementById('noticiasList');
    if (!container) {
        console.error('Container de notícias não encontrado!');
        return;
    }
    
    container.innerHTML = '';
    
    // Garantir que noticias é um array
    if (!Array.isArray(noticias) || noticias.length === 0) {
        container.innerHTML = `
            <div class="no-result">
                <div class="no-result-icon">📰</div>
                <h4>Nenhuma notícia publicada</h4>
                <p>Clique em "Nova Notícia" para começar a publicar.</p>
                        </div>
                    `;
        return;
    }
    
    noticias.forEach((noticia, index) => {
        console.log(`Processando notícia ${index}:`, noticia);
        console.log(`Fotos da notícia ${index}:`, noticia.fotos);
        
        // Tratar fotos
        let fotosArray = [];
        if (noticia.fotos) {
            if (typeof noticia.fotos === 'string') {
                // Fotos salvas como string separada por vírgulas
                fotosArray = noticia.fotos.split(',').filter(foto => foto.trim() !== '');
            } else if (Array.isArray(noticia.fotos)) {
                // Fotos já como array
                fotosArray = noticia.fotos;
            }
        }
        
        console.log(`Fotos da notícia ${index}:`, fotosArray);
        
        // Validar campos obrigatórios
        if (!noticia || !noticia.titulo || !noticia.conteudo) {
            console.warn('Notícia com dados inválidos:', noticia);
            return;
        }
        
        const card = document.createElement('div');
        card.className = 'noticia-card';
        
        // Tratar conteúdo com segurança
        const conteudo = noticia.conteudo || '';
        const titulo = noticia.titulo || 'Sem título';
        
        console.log(`Notícia ${index} - Título: "${titulo}", Conteúdo: "${conteudo.substring(0, 50)}..."`);
        
        // Processar quebras de linha no conteúdo
        const paragrafos = conteudo.split('\n').filter(linha => linha.trim() !== '');
        const conteudoFormatado = paragrafos.map(paragrafo => `<p>${paragrafo}</p>`).join('');
        
        // Tratar data com segurança
        let dataFormatada = 'Data não disponível';
        try {
            if (noticia.dataCriacao) {
                dataFormatada = new Date(noticia.dataCriacao).toLocaleDateString('pt-BR');
            } else if (noticia.data_publicacao) {
                dataFormatada = new Date(noticia.data_publicacao).toLocaleDateString('pt-BR');
            }
        } catch (e) {
            console.warn('Erro ao formatar data:', e);
        }
        
        // Gerar HTML das fotos
        let fotosHTML = '';
        if (fotosArray.length > 0) {
            fotosHTML = `
                <div class="noticia-fotos">
                    ${fotosArray.map(foto => {
                        // Limpar a URL da foto
                        const fotoUrl = foto.trim();
                        if (fotoUrl && (fotoUrl.startsWith('http') || fotoUrl.startsWith('data:'))) {
                            return `<img src="${fotoUrl}" alt="Foto da notícia" class="noticia-foto">`;
                        } else {
                            return `<div class="noticia-foto-info">📷 Foto</div>`;
                        }
                    }).join('')}
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="noticia-header">
                <h3>${titulo}</h3>
                <span class="noticia-data">${dataFormatada}</span>
            </div>
            <div class="noticia-content">
                <div class="noticia-texto">
                    ${conteudoFormatado}
                </div>
                ${fotosHTML}
            </div>
            <div class="noticia-actions">
                <button class="delete-btn" onclick="deletarNoticia('${noticia.id}')">
                    <span class="btn-icon">🗑️</span>
                    <span>Apagar</span>
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    console.log('Renderização concluída');
}

async function deletarNoticia(noticiaId) {
    if (!confirm('Tem certeza que deseja apagar esta notícia?')) {
        return;
    }
    
    try {
        const url = `https://policiamilitarnovacapital.onrender.com/api/noticias/${noticiaId}`;
            const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        carregarNoticias();
        
    } catch (error) {
        console.log('Erro ao deletar notícia:', error.message);
    }
}

async function handleDeleteNoticias() {
    const checkboxes = document.querySelectorAll('.noticia-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('Selecione pelo menos uma notícia para apagar');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja apagar ${checkboxes.length} notícia(s)?`)) {
        return;
    }
    
    try {
        const noticiaIds = Array.from(checkboxes).map(cb => cb.value);
        
        for (const id of noticiaIds) {
            const url = `https://policiamilitarnovacapital.onrender.com/api/noticias/${id}`;
            await fetch(url, {
                    method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
                });
                }
        
        carregarNoticias();
        
            } catch (error) {
        console.log('Erro ao deletar notícias:', error.message);
    }
}

async function handleSaveSettings() {
    const nome = document.getElementById('settingNome').value.trim();
    const email = document.getElementById('settingEmail').value.trim();
    const departamento = document.getElementById('settingDepartamento').value;
    
    if (!nome || !email || !departamento) {
        alert('Preencha todos os campos');
        return;
    }
    
    const spinner = document.getElementById('saveSettingsSpinner');
    const btnText = document.querySelector('#saveSettingsBtn .btn-text');
    
    spinner.style.display = 'inline-block';
    btnText.style.display = 'none';
    
    try {
        const savedAccount = localStorage.getItem('adminAccount');
        const accountData = JSON.parse(savedAccount);
        
        const updatedAccount = {
            ...accountData,
            name: nome,
            email: email,
            departamento: departamento
        };
        
        localStorage.setItem('adminAccount', JSON.stringify(updatedAccount));
        
        document.getElementById('adminName').textContent = nome;
        document.getElementById('adminEmail').textContent = email;
        document.getElementById('adminDepartamento').textContent = departamento;
        
        alert('Configurações salvas com sucesso!');
        
    } catch (error) {
        console.log('Erro ao salvar configurações:', error.message);
        alert('Erro ao salvar configurações');
    } finally {
        spinner.style.display = 'none';
        btnText.style.display = 'inline';
    }
}

async function testarConexaoServidor() {
    try {
        console.log('Testando conexão com o servidor...');
        const response = await fetch('https://policiamilitarnovacapital.onrender.com/api/noticias', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Status da resposta:', response.status);
        console.log('Headers:', response.headers);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Dados recebidos:', data);
            return true;
        } else {
            console.log('Erro na resposta:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('Erro na conexão:', error);
        return false;
    }
}

async function testarPublicacaoSimples() {
    try {
        console.log('Testando publicação simples...');
        
        const url = 'https://policiamilitarnovacapital.onrender.com/api/noticias';
        
        const noticiaTeste = {
            titulo: "Teste de Publicação",
            conteudo: "Esta é uma notícia de teste para verificar se o servidor está funcionando.",
        data_publicacao: new Date().toISOString()
    };
    
        console.log('Dados de teste:', noticiaTeste);
        
            const response = await fetch(url, {
                method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(noticiaTeste)
        });
        
        console.log('Status da resposta:', response.status);
            
            if (response.ok) {
            const resultado = await response.json();
            console.log('Teste bem-sucedido:', resultado);
            alert('✅ Teste de publicação funcionou! O servidor está OK.');
            return true;
        } else {
            const errorText = await response.text();
            console.log('Erro no teste:', errorText);
            alert('❌ Teste falhou. Problema no servidor.');
            return false;
        }
        
        } catch (error) {
        console.error('Erro no teste:', error);
        alert('❌ Erro de conexão no teste.');
        return false;
    }
}

// Adicionar botão de teste no HTML
function adicionarBotaoTeste() {
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        // Botão de teste do servidor
        const botaoTeste = document.createElement('button');
        botaoTeste.className = 'test-btn';
        botaoTeste.innerHTML = '<span class="btn-icon">🧪</span><span>Testar Servidor</span>';
        botaoTeste.onclick = testarPublicacaoSimples;
        headerActions.appendChild(botaoTeste);
        
            // Botão de configurar ImgBB (removido - chave configurada automaticamente)
    // const botaoImgBB = document.createElement('button');
    // botaoImgBB.className = 'imgbb-btn';
    // botaoImgBB.innerHTML = '<span class="btn-icon">📸</span><span>Configurar ImgBB</span>';
    // botaoImgBB.onclick = configurarImgBB;
    // headerActions.appendChild(botaoImgBB);
        
        // Botão de testar upload
        const botaoTesteUpload = document.createElement('button');
        botaoTesteUpload.className = 'upload-test-btn';
        botaoTesteUpload.innerHTML = '<span class="btn-icon">🧪</span><span>Testar Upload</span>';
        botaoTesteUpload.onclick = testarUploadImagem;
        headerActions.appendChild(botaoTesteUpload);
        

        
        // Botão de visualizar backups
        const botaoBackups = document.createElement('button');
        botaoBackups.className = 'backup-btn';
        botaoBackups.innerHTML = '<span class="btn-icon">📸</span><span>Ver Backups</span>';
        botaoBackups.onclick = visualizarBackupsImagens;
        headerActions.appendChild(botaoBackups);
        
        // Botão de limpar backups
        const botaoLimpar = document.createElement('button');
        botaoLimpar.className = 'clear-btn';
        botaoLimpar.innerHTML = '<span class="btn-icon">🗑️</span><span>Limpar Backups</span>';
        botaoLimpar.onclick = limparBackupsAntigos;
        headerActions.appendChild(botaoLimpar);
    }
}

// Função para salvar imagem localmente
function salvarImagemLocalmente(dataUrl, fileName) {
    try {
        // Criar um link de download
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return `assets/uploads/${fileName}`;
    } catch (error) {
        console.error('Erro ao salvar imagem:', error);
        return null;
    }
}

// Configuração da API ImgBB (gratuita)
const IMGBB_API_KEY = 'f1c5a9553acee05b8acf2ee0e5d5dc56'; // Chave configurada automaticamente
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

// Função para fazer upload de imagem para ImgBB
async function uploadImagemParaImgBB(dataUrl, fileName) {
    try {
        console.log('Fazendo upload para ImgBB:', fileName);
        
        // Obter API key configurada
        const apiKey = getImgBBAPIKey();
        if (!apiKey || apiKey.trim() === '') {
            throw new Error('API Key do ImgBB não configurada');
        }
        
        // Converter base64 para blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        
        // Criar FormData
        const formData = new FormData();
        formData.append('image', blob, fileName);
        formData.append('key', apiKey);
        formData.append('name', fileName);
        
        console.log('Enviando para ImgBB...');
        
        // Fazer upload
        const uploadResponse = await fetch(IMGBB_UPLOAD_URL, {
            method: 'POST',
            body: formData
        });
        
        console.log('Resposta do ImgBB:', uploadResponse.status);
        
        if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            console.log('Resultado completo do ImgBB:', result);
            
            if (result.success && result.data) {
                return {
                    url: result.data.url,
                    delete_url: result.data.delete_url,
                    thumb: result.data.thumb?.url || result.data.url,
                    medium: result.data.medium?.url || result.data.url
                };
    } else {
                throw new Error('Falha no upload: ' + (result.error?.message || 'Resposta inválida'));
            }
        } else {
            const errorText = await uploadResponse.text();
            console.error('Erro HTTP do ImgBB:', errorText);
            throw new Error(`HTTP ${uploadResponse.status}: ${errorText}`);
        }
        
    } catch (error) {
        console.error('Erro no upload para ImgBB:', error);
        throw error;
    }
}

// Função para processar imagens antes do envio (versão com upload)
async function processarImagensParaEnvio(fotos) {
    if (!fotos || fotos.length === 0) return [];
    
    const fotosProcessadas = [];
    
    for (const foto of fotos) {
        try {
            let urlFinal = foto;
            
            // Se é um objeto com dataUrl, fazer upload
            if (foto.dataUrl) {
                const uploadResult = await uploadImagemParaImgBB(foto.dataUrl, foto.name);
                urlFinal = uploadResult.url;
                console.log(`Imagem ${foto.name} enviada para:`, urlFinal);
            }
            // Se é apenas o dataUrl direto
            else if (typeof foto === 'string' && foto.startsWith('data:')) {
                const fileName = `imagem_${Date.now()}.jpg`;
                const uploadResult = await uploadImagemParaImgBB(foto, fileName);
                urlFinal = uploadResult.url;
                console.log(`Imagem ${fileName} enviada para:`, urlFinal);
            }
            // Se já é um link, manter como está
            else if (typeof foto === 'string' && foto.startsWith('http')) {
                urlFinal = foto;
            }
            
            fotosProcessadas.push(urlFinal);
            
        } catch (error) {
            console.error('Erro ao processar imagem:', error);
            // Se falhar o upload, usar o dataUrl original
            const fallbackUrl = foto.dataUrl || foto;
            fotosProcessadas.push(fallbackUrl);
        }
    }
    
    return fotosProcessadas;
}

// Função para criar um arquivo de backup das imagens
function criarBackupImagens(fotos) {
    if (!fotos || fotos.length === 0) return;
    
    const backupData = {
        timestamp: new Date().toISOString(),
        imagens: fotos.map(foto => ({
            nome: foto.name || `imagem_${Date.now()}.jpg`,
            dataUrl: foto.dataUrl || foto,
            tamanho: foto.size || 0
        }))
    };
    
    // Salvar no localStorage como backup
    const backups = JSON.parse(localStorage.getItem('imagensBackup') || '[]');
    backups.push(backupData);
    localStorage.setItem('imagensBackup', JSON.stringify(backups));
    
    console.log('Backup de imagens criado:', backupData);
}

// Função para visualizar backups de imagens
function visualizarBackupsImagens() {
    const backups = JSON.parse(localStorage.getItem('imagensBackup') || '[]');
    
    if (backups.length === 0) {
        alert('Nenhum backup de imagem encontrado.');
        return;
    }
    
    let mensagem = '📸 Backups de Imagens:\n\n';
    
    backups.forEach((backup, index) => {
        const data = new Date(backup.timestamp).toLocaleString('pt-BR');
        mensagem += `📅 ${data}\n`;
        mensagem += `📁 ${backup.imagens.length} imagem(ns)\n\n`;
        
        backup.imagens.forEach((img, imgIndex) => {
            mensagem += `  ${imgIndex + 1}. ${img.nome} (${(img.tamanho / 1024).toFixed(1)} KB)\n`;
        });
        mensagem += '\n';
    });
    
    alert(mensagem);
}

// Função para limpar backups antigos
function limparBackupsAntigos() {
    const backups = JSON.parse(localStorage.getItem('imagensBackup') || '[]');
    
    if (backups.length === 0) {
        alert('Nenhum backup para limpar.');
        return;
    }
    
    if (confirm(`Deseja limpar ${backups.length} backup(s) de imagem?`)) {
        localStorage.removeItem('imagensBackup');
        alert('Backups limpos com sucesso!');
    }
}

// Função para configurar API key do ImgBB
function configurarImgBB() {
    alert('✅ ImgBB já está configurado automaticamente!\n\nA chave da API já está configurada no sistema.\n\nVocê pode fazer upload de imagens diretamente.');
    return true;
}

// Função para obter API key do localStorage
function getImgBBAPIKey() {
    // Sempre retorna a chave configurada automaticamente
    return IMGBB_API_KEY;
}

// Função para verificar se a API key é válida
async function verificarAPIKeyImgBB() {
    try {
        const apiKey = getImgBBAPIKey();
        // Chave já está configurada automaticamente
        if (!apiKey || apiKey.trim() === '') {
            return { valida: false, motivo: 'API Key não configurada' };
        }
        
        // Fazer um teste simples com a API
        const testUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;
        const testResponse = await fetch(testUrl, {
            method: 'POST',
            body: new FormData() // Envio vazio para testar a API
        });
        
        if (testResponse.status === 400) {
            // 400 é esperado para envio vazio, significa que a API está funcionando
            return { valida: true, motivo: 'API Key válida' };
        } else if (testResponse.status === 403) {
            return { valida: false, motivo: 'API Key inválida' };
        } else {
            return { valida: true, motivo: 'API Key válida' };
        }
        
            } catch (error) {
        console.error('Erro ao verificar API Key:', error);
        return { valida: false, motivo: 'Erro de conexão' };
    }
}

// Função para verificar se ImgBB está configurado (melhorada)
async function verificarConfiguracaoImgBB() {
    // Chave já está configurada automaticamente
    const apiKey = getImgBBAPIKey();
    
    // Verificar se a API key é válida
    const verificacao = await verificarAPIKeyImgBB();
    if (!verificacao.valida) {
        console.warn(`⚠️ API Key pode ter problemas: ${verificacao.motivo}`);
        // Mesmo com problema, continuar pois a chave está configurada
    }
    
    return true; // Sempre retorna true pois a chave está configurada
}

// Função para processar imagens localmente (fallback)
function processarImagensParaEnvioLocal(fotos) {
    if (!fotos || fotos.length === 0) return [];
    
    return fotos.map(foto => {
        // Se é um objeto com dataUrl, usar o dataUrl
        if (foto.dataUrl) {
            return foto.dataUrl;
        }
        // Se é apenas o dataUrl direto
        else if (typeof foto === 'string' && foto.startsWith('data:')) {
            return foto;
        }
        // Se já é um link, manter como está
        else if (typeof foto === 'string' && foto.startsWith('http')) {
            return foto;
        }
        
        return foto;
    });
}

async function testarUploadImagem() {
    try {
        // Verificar se há fotos selecionadas
        if (!window.noticiaFotos || window.noticiaFotos.length === 0) {
            alert('❌ Nenhuma foto selecionada.\n\nSelecione fotos primeiro.');
            return;
        }
        
        console.log('Testando upload de imagem...');
        
        // Verificar configuração do ImgBB
        const imgbbConfigurado = await verificarConfiguracaoImgBB();
        
        if (!imgbbConfigurado) {
            alert('❌ ImgBB não está configurado.\n\nConfigure a API key do ImgBB primeiro.');
            return;
        }
        
        // Testar upload da primeira foto
        const primeiraFoto = window.noticiaFotos[0];
        console.log('Testando upload da foto:', primeiraFoto.nome);
        
        const uploadResult = await uploadImagemParaImgBB(primeiraFoto.dataUrl, primeiraFoto.nome);
        
        console.log('Resultado do upload:', uploadResult);
        
        if (uploadResult && uploadResult.url) {
            alert(`✅ Upload testado com sucesso!\n\n📸 URL: ${uploadResult.url}\n\n📏 Tamanho: ${uploadResult.size} bytes`);
        } else {
            alert('❌ Falha no upload de teste.');
        }
        
    } catch (error) {
        console.error('Erro no teste de upload:', error);
        alert('❌ Erro no teste de upload: ' + error.message);
    }
}

// Google Sign-In será carregado automaticamente pelo script do Google

// Função para verificar senha do Google
function verifyGooglePassword() {
    const password = document.getElementById('googlePassword').value;
    const errorElement = document.getElementById('passwordError');
    const spinner = document.getElementById('passwordSpinner');
    const btnText = document.querySelector('#verifyPasswordBtn .btn-text');
    
    if (!password) {
        showPasswordError('Digite sua senha de 8 dígitos');
        return;
    }
    
    if (password.length !== 8) {
        showPasswordError('A senha deve ter exatamente 8 dígitos');
        return;
    }
    
    // Mostrar loading
    spinner.style.display = 'inline-block';
    btnText.style.display = 'none';
    
    // Simular verificação (você pode alterar a senha aqui)
    setTimeout(() => {
        const senhaCorreta = '!)@(#*$&'; // Senha padrão para teste
        
        if (password === senhaCorreta) {
            // Senha correta - fazer login
            const googleName = localStorage.getItem('tempGoogleName');
            const googleEmail = localStorage.getItem('tempGoogleEmail');
            
            // Salvar dados permanentes
            localStorage.setItem('adminName', googleName);
            localStorage.setItem('adminEmail', googleEmail);
            localStorage.setItem('adminDepartamento', 'Developer');
            localStorage.setItem('isLoggedIn', 'true');
            
            // Limpar dados temporários
            localStorage.removeItem('tempGoogleName');
            localStorage.removeItem('tempGoogleEmail');
            localStorage.removeItem('tempGooglePicture');
            
            // Esconder loading
            spinner.style.display = 'none';
            btnText.style.display = 'inline';
            
            // Mostrar dashboard
            showDashboard();
            
        } else {
            // Senha incorreta
            spinner.style.display = 'none';
            btnText.style.display = 'inline';
            showPasswordError('Senha incorreta. Tente novamente.');
            document.getElementById('googlePassword').value = '';
            document.getElementById('googlePassword').focus();
        }
    }, 1000);
}

// Função para cancelar login Google
function cancelGoogleLogin() {
    // Limpar dados temporários
    localStorage.removeItem('tempGoogleName');
    localStorage.removeItem('tempGoogleEmail');
    localStorage.removeItem('tempGooglePicture');
    
    // Voltar para tela de login
    showLogin();
}

// Função para mostrar erro de senha
function showPasswordError(message) {
    const errorElement = document.getElementById('passwordError');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}









// Função para verificar novas denúncias automaticamente
function iniciarVerificacaoAutomatica() {
    // Apenas verificar quando a janela ganha foco (quando voltar do formulário)
    window.addEventListener('focus', () => {
        console.log('Janela ganhou foco - verificando novas denúncias...');
        carregarDenuncias();
    });
}

// Função para verificar novas denúncias no localStorage (SIMPLIFICADA)
function verificarNovasDenunciasLocal() {
    console.log('Verificação manual de novas denúncias...');
    carregarDenuncias();
}













// Função removida - não é mais necessária



// Função removida - não é mais necessária

// Função para lidar com o login do Google
function handleGoogleLogin(response) {
    console.log('Login Google recebido:', response);
    
    // Decodificar o token JWT
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    console.log('Payload do token:', payload);
    
    // Salvar dados do usuário
    localStorage.setItem('googleToken', response.credential);
    localStorage.setItem('adminName', payload.name);
    localStorage.setItem('adminEmail', payload.email);
    
    // Verificar se o usuário existe no banco
    verificarUsuarioGoogle(payload.email, payload.name);
}

// Função para verificar se o usuário existe no banco
async function verificarUsuarioGoogle(email, name) {
    try {
        console.log('Verificando usuário Google:', email);
        
        // Salvar dados do usuário Google temporariamente
        localStorage.setItem('tempGoogleName', name);
        localStorage.setItem('tempGoogleEmail', email);
        localStorage.setItem('tempGooglePicture', 'assets/admin.png'); // Usar avatar padrão
        
        // Mostrar tela de verificação de senha
        showGooglePasswordScreen();
        
    } catch (error) {
        console.error('Erro na verificação:', error);
        alert('Erro ao conectar com o servidor. Tente novamente.');
    }
}

function signOutGoogle() {
    // Verificar se o Google Sign-In está disponível
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
        google.accounts.id.revoke(localStorage.getItem('googleToken'), () => {
            console.log('Token do Google revogado');
        });
    }
    
    // Limpar dados do localStorage
    localStorage.removeItem('googleToken');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminDepartamento');
    
    // Mostrar tela de login
    showLogin();
    
    // Recarregar a página para garantir limpeza completa
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Inicializar Google Sign-In
function initializeGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
            client_id: '759670506611-0kvv5vfd8rmc7a53h0c4aktcc42seqiu.apps.googleusercontent.com',
            callback: handleGoogleLogin,
            auto_select: false,
            cancel_on_tap_outside: true
        });
        
        console.log('Google Sign-In inicializado');
    } else {
        console.log('Google Sign-In não disponível');
    }
}

// Carregar script do Google Sign-In
function loadGoogleSignIn() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);
}

// Função para gerar protocolo aleatório
function gerarProtocolo() {
    // Gerar 4 dígitos aleatórios
    const digitos = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    return digitos.toString();
}

// Função para verificar se protocolo já existe
function protocoloExiste(protocolo) {
    const denunciasExistentes = JSON.parse(localStorage.getItem('denunciasSimuladas') || '[]');
    return denunciasExistentes.some(d => d.protocolo === protocolo);
}

// Função para gerar protocolo único
function gerarProtocoloUnico() {
    let protocolo;
    do {
        protocolo = gerarProtocolo();
    } while (protocoloExiste(protocolo));
    return protocolo;
}

// Melhorias de interatividade para os botões
function addRippleEffect(element) {
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

// Adicionar efeitos de interatividade para todos os botões
function setupButtonInteractions() {
    const buttons = document.querySelectorAll('.search-btn, .refresh-btn, .delete-btn, .save-btn, .logout-btn, .setup-btn');
    
    buttons.forEach(button => {
        // Efeito de ripple no clique
        button.addEventListener('click', function(e) {
            addRippleEffect(this);
            
            // Adicionar classe de loading temporariamente
            this.classList.add('loading');
            setTimeout(() => {
                this.classList.remove('loading');
            }, 1000);
        });
        
        // Melhorar feedback visual
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-1px) scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
    });
}

// Melhorar navegação do sidebar
function setupSidebarInteractions() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Adicionar efeito de ripple
            addRippleEffect(this);
            
            // Animação suave da transição
            this.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                this.style.transition = '';
            }, 300);
        });
    });
}

// Inicializar melhorias de interatividade
document.addEventListener('DOMContentLoaded', function() {
    setupButtonInteractions();
    setupSidebarInteractions();
});




