// Script simples para o modal da equipe
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script da equipe carregado');
    
    const equipeBtn = document.getElementById('equipeBtn');
    const equipeModal = document.getElementById('equipeModal');
    const closeBtn = document.getElementById('closeEquipeModal');
    
    console.log('Elementos:', {equipeBtn, equipeModal, closeBtn});
    
    // Abrir modal
    if (equipeBtn) {
        equipeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botão Equipe clicado!');
            
            if (equipeModal) {
                equipeModal.style.display = 'block';
                equipeModal.style.zIndex = '9999';
                document.body.style.overflow = 'hidden';
                console.log('Modal aberto');
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
}); 