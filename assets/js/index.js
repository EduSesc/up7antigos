document.addEventListener('DOMContentLoaded', async function() {
    const promoBanner = document.getElementById('promo-banner');
    const promoImage = document.getElementById('promo-image');
    const whatsappLink = document.getElementById('whatsapp-link');
    const closeBtn = document.getElementById('close-btn');
    const body = document.body;

    // Configuração Supabase
    const SUPABASE_URL = "https://wthcwllhzbahvnnjqlko.supabase.co"; 
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aGN3bGxoemJhaHZubmpxbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTk5NjMsImV4cCI6MjA3MDA5NTk2M30.7uzMcp8NsyxYuMmN7nnbBB0dJITJ_C7O7Ck0HFQgbOA";
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Buscar promoção válida (data atual entre start_date e end_date)
    const hoje = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .eq("is_active", true)      // só pega se estiver ativa
        .lte("start_date", hoje)   // início já passou
        .gte("end_date", hoje)     // ainda não terminou
        .single(); // pega só uma

    if (error) {
        console.log("Erro ao buscar promoção:", error.message);
        return;
    }

    if (data) {
        // Preencher dinamicamente a imagem e o alt
        promoImage.src = data.image_url;
        promoImage.alt = data.alt_text;

        // Atualizar link do WhatsApp
        whatsappLink.href = `https://wa.me/5561985804280?text=${encodeURIComponent(data.whatsapp_message)}`;
    } else {
        console.log("Nenhuma promoção ativa encontrada.");
        return; // não exibe banner
    }

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

        setTimeout(function() {
            promoBanner.style.display = 'none';
            overlay.style.display = 'none';
        }, 500);
    }
});