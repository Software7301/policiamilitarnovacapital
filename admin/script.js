window.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('adminLogado') === '1') {
        document.getElementById('adminLogin').style.display = 'none';
        const painel = document.getElementById('adminPanel');
        painel.style.display = 'block';
        painel.classList.add('fade-in');
        carregarDenuncias();
        carregarInteressadosCOE();
    }
});

// Funcionalidade das abas
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('tab-button')) {
        // Remove active de todas as abas
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Adiciona active na aba clicada
        e.target.classList.add('active');
        const tabName = e.target.getAttribute('data-tab');
        document.getElementById(tabName + '-tab').classList.add('active');
    }
});

document.getElementById('entrarAdmin').onclick = async function() {
    const btn = this;
    const senha = document.getElementById('adminSenha').value;
    btn.disabled = true;
    btn.innerHTML = 'Verificando... <span class="login-spinner"></span>';
    document.getElementById('loginErro').textContent = '';
    await new Promise(res => setTimeout(res, 4000));
    if (senha === 'PMNC') {
        localStorage.setItem('adminLogado', '1');
        document.getElementById('adminLogin').style.display = 'none';
        const painel = document.getElementById('adminPanel');
        painel.style.display = 'block';
        painel.classList.add('fade-in');
        carregarDenuncias();
        carregarInteressadosCOE();
    } else {
        document.getElementById('loginErro').textContent = 'Senha incorreta!';
        btn.disabled = false;
        btn.innerHTML = 'Entrar';
    }
};
document.getElementById('logoutAdmin').onclick = function() {
    localStorage.removeItem('adminLogado');
    document.getElementById('adminLogin').style.display = 'block';
    const painel = document.getElementById('adminPanel');
    painel.style.display = 'none';
    painel.classList.remove('fade-in');
    document.getElementById('adminSenha').value = '';
    document.getElementById('loginErro').textContent = '';
    const btn = document.getElementById('entrarAdmin');
    btn.disabled = false;
    btn.innerHTML = 'Entrar';
};

async function carregarDenuncias() {
    const lista = document.getElementById('listaDenuncias');
    lista.innerHTML = '';
    let denuncias = [];
    
    // URLs para tentar (incluindo Render)
    const urls = [
        'https://ouvidoria-pm-backend.onrender.com/api/denuncias',
        'http://localhost:5000/api/denuncias'
    ];
    
    for (const url of urls) {
        try {
            console.log('Tentando carregar denúncias de:', url);
            const resp = await fetch(url);
            if (resp.ok) {
                denuncias = await resp.json();
                break;
            }
        } catch (error) {
            console.log('Erro ao tentar URL:', url, error);
            continue;
        }
    }
    
    if (denuncias.length === 0) {
        lista.innerHTML = '<p>Erro ao buscar denúncias do backend ou nenhuma denúncia registrada.</p>';
        return;
    }
    
    denuncias.forEach((d, i) => {
        const div = document.createElement('div');
        div.className = 'denuncia-admin';
        div.id = 'denuncia-' + d.protocolo;
        
        // Formatar data se existir
        let dataFormatada = '';
        if (d.finalizada_em) {
            const data = new Date(d.finalizada_em);
            dataFormatada = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        }
        
        div.innerHTML = `
            <div><label>Protocolo:</label> <span style='font-family:monospace;'>${d.protocolo}</span></div>
            <div><label>Nome:</label> ${d.nome || '<em>Anônimo</em>'}</div>
            <div><label>RG:</label> ${d.rg || '-'}</div>
            <div><label>Tipo:</label> <span style='font-weight: bold; color: #004b87;'>${d.tipo}</span></div>
            <div><label>Descrição:</label> ${d.descricao}</div>
            <div><label>Link YouTube:</label> ${d.youtube ? `<a href='${d.youtube}' target='_blank'>${d.youtube}</a>` : '-'}</div>
            <div><label>Status:</label> <span class='status-admin'>${d.status}</span></div>
            ${dataFormatada ? `<div><label>Finalizada em:</label> ${dataFormatada}</div>` : ''}
            <div style='margin-top: 6px;'>
                <select data-index='${i}' data-protocolo='${d.protocolo}'>
                    <option value='Em análise' ${d.status==='Em análise'?'selected':''}>Em análise</option>
                    <option value='Finalizada' ${d.status==='Finalizada'?'selected':''}>Finalizada</option>
                </select>
            </div>
        `;
        lista.appendChild(div);
    });
    lista.querySelectorAll('select').forEach(sel => {
        sel.onchange = async function(e) {
            e.preventDefault && e.preventDefault();
            const protocolo = this.getAttribute('data-protocolo');
            const novoStatus = this.value;
            
            // Tentar atualizar em diferentes URLs
            const updateUrls = [
                `https://ouvidoria-pm-backend.onrender.com/api/denuncias/${protocolo}`,
                `http://localhost:5000/api/denuncias/${protocolo}`
            ];
            
            let success = false;
            for (const url of updateUrls) {
                try {
                    const resp = await fetch(url, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: novoStatus })
                    });
                    if (resp.ok) {
                        success = true;
                        break;
                    }
                } catch (error) {
                    console.log('Erro ao atualizar status:', url, error);
                    continue;
                }
            }
            
            if (success) {
                const statusSpan = this.parentNode.querySelector('.status-admin');
                if (statusSpan) {
                    statusSpan.classList.remove('fade-status');
                    void statusSpan.offsetWidth;
                    statusSpan.classList.add('fade-status');
                    setTimeout(() => statusSpan.classList.remove('fade-status'), 500);
                }
                if (novoStatus === 'Finalizada') {
                    const denunciaDiv = document.getElementById('denuncia-' + protocolo);
                    if (denunciaDiv) {
                        denunciaDiv.classList.add('fade-out');
                        setTimeout(() => denunciaDiv.remove(), 1000);
                    }
                }
            }
        };
    });
}

async function carregarInteressadosCOE() {
    const lista = document.getElementById('listaInteressadosCOE');
    lista.innerHTML = '';
    let interessados = [];
    
    // URLs para tentar (incluindo Render)
    const urls = [
        'https://ouvidoria-pm-backend.onrender.com/api/interessados-coe',
        'http://localhost:5000/api/interessados-coe'
    ];
    
    for (const url of urls) {
        try {
            console.log('Tentando carregar interessados de:', url);
            const resp = await fetch(url);
            if (resp.ok) {
                interessados = await resp.json();
                break;
            }
        } catch (error) {
            console.log('Erro ao tentar URL:', url, error);
            continue;
        }
    }
    
    if (interessados.length === 0) {
        lista.innerHTML = '<p>Erro ao buscar interessados do backend ou nenhum interessado registrado.</p>';
        return;
    }
    
    interessados.forEach((i, index) => {
        const div = document.createElement('div');
        div.className = 'denuncia-admin';
        div.id = 'interessado-' + i.protocolo;
        
        // Formatar data
        const data = new Date(i.data_cadastro);
        const dataFormatada = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        
        div.innerHTML = `
            <div><label>Protocolo:</label> <span style='font-family:monospace;'>${i.protocolo}</span></div>
            <div><label>Nome:</label> ${i.nome}</div>
            <div><label>RG:</label> ${i.rg}</div>
            <div><label>Telefone:</label> ${i.telefone}</div>
            <div><label>Horário:</label> ${i.horario}</div>
            <div><label>Motivo:</label> ${i.motivo}</div>
            <div><label>Data Cadastro:</label> ${dataFormatada}</div>
            <div><label>Status:</label> <span class='status-admin'>${i.status}</span></div>
            <div style='margin-top: 6px;'>
                <select data-index='${index}' data-protocolo='${i.protocolo}'>
                    <option value='Pendente' ${i.status==='Pendente'?'selected':''}>Pendente</option>
                    <option value='Em análise' ${i.status==='Em análise'?'selected':''}>Em análise</option>
                    <option value='Aprovado' ${i.status==='Aprovado'?'selected':''}>Aprovado</option>
                    <option value='Reprovado' ${i.status==='Reprovado'?'selected':''}>Reprovado</option>
                </select>
            </div>
        `;
        lista.appendChild(div);
    });
    lista.querySelectorAll('select').forEach(sel => {
        sel.onchange = async function(e) {
            e.preventDefault && e.preventDefault();
            const protocolo = this.getAttribute('data-protocolo');
            const novoStatus = this.value;
            
            // Tentar atualizar em diferentes URLs
            const updateUrls = [
                `https://ouvidoria-pm-backend.onrender.com/api/interessados-coe/${protocolo}`,
                `http://localhost:5000/api/interessados-coe/${protocolo}`
            ];
            
            let success = false;
            for (const url of updateUrls) {
                try {
                    const resp = await fetch(url, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: novoStatus })
                    });
                    if (resp.ok) {
                        success = true;
                        break;
                    }
                } catch (error) {
                    console.log('Erro ao atualizar status:', url, error);
                    continue;
                }
            }
            
            if (success) {
                const statusSpan = this.parentNode.querySelector('.status-admin');
                if (statusSpan) {
                    statusSpan.classList.remove('fade-status');
                    void statusSpan.offsetWidth;
                    statusSpan.classList.add('fade-status');
                    setTimeout(() => statusSpan.classList.remove('fade-status'), 500);
                }
            }
        };
    });
}
