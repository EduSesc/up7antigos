document.addEventListener('DOMContentLoaded', function() {
    const promoBanner = document.getElementById('promo-banner');
    const closeBtn = document.getElementById('close-btn');
    const body = document.body;
    
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    body.appendChild(overlay);
    
    // Mostrar o banner e overlay após 1.5 segundos
    setTimeout(function() {
        promoBanner.classList.add('show');
        overlay.classList.add('show');
    }, 1500);
    
    // Fechar o banner quando o botão X é clicado
    closeBtn.addEventListener('click', function() {
        closeBanner();
    });
    
    // Fechar o banner quando clicar no overlay
    overlay.addEventListener('click', function() {
        closeBanner();
    });
    
    // Fechar o banner automaticamente após 8 segundos
    setTimeout(function() {
        if (promoBanner.classList.contains('show')) {
            closeBanner();
        }
    }, 8000);
    
    // Função para fechar o banner
    function closeBanner() {
        promoBanner.classList.remove('show');
        overlay.classList.remove('show');
        
        // Remover completamente após a animação
        setTimeout(function() {
            promoBanner.style.display = 'none';
            overlay.style.display = 'none';
        }, 500);
    }
    
});