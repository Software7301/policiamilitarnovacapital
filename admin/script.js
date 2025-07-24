window.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('adminLogado') === '1') {
        document.getElementById('adminLogin').style.display = 'none';
        const painel = document.getElementById('adminPanel');
        painel.style.display = 'block';
        painel.classList.add('fade-in');
        carregarDenuncias();
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
    try {
        const resp = await fetch('http://192.168.1.7:5000/api/denuncias');
        denuncias = await resp.json();
    } catch {
        lista.innerHTML = '<p>Erro ao buscar denúncias do backend.</p>';
        return;
    }
    if (denuncias.length === 0) {
        lista.innerHTML = '<p>Nenhuma denúncia registrada.</p>';
        return;
    }
    denuncias.forEach((d, i) => {
        const div = document.createElement('div');
        div.className = 'denuncia-admin';
        div.id = 'denuncia-' + d.protocolo;
        div.innerHTML = `
            <div><label>Protocolo:</label> <span style='font-family:monospace;'>${d.protocolo}</span></div>
            <div><label>Nome:</label> ${d.nome || '<em>Anônimo</em>'}</div>
            <div><label>RG:</label> ${d.rg || '-'}</div>
            <div><label>Tipo:</label> ${d.tipo}</div>
            <div><label>Descrição:</label> ${d.descricao}</div>
            <div><label>Link YouTube:</label> <a href='${d.youtube}' target='_blank'>${d.youtube}</a></div>
            <div><label>Status:</label> <span class='status-admin'>${d.status}</span></div>
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
            await fetch(`http://192.168.1.7:5000/api/denuncias/${protocolo}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus })
            });
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
        };
    });
}
