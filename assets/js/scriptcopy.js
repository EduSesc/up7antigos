// =============================================
// CONFIGURAÇÕES GLOBAIS E INICIALIZAÇÃO
// =============================================

// Configuração do Supabase
const supabaseUrl = 'https://wthcwllhzbahvnnjqlko.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aGN3bGxoemJhaHZubmpxbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTk5NjMsImV4cCI6MjA3MDA5NTk2M30.7uzMcp8NsyxYuMmN7nnbBB0dJITJ_C7O7Ck0HFQgbOA';
const supabase = createClient(supabaseUrl, supabaseKey);

// Variáveis globais
let currentSlide = 0;
let isLoggedIn = false;
let currentTab = 'vehicles';

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// =============================================
// FUNÇÕES PRINCIPAIS
// =============================================

function initializeApp() {
    // Inicializa todos os módulos
    initializeNavigation();
    initializeCarousel();
    initializeFilters();
    initializeVideoModal();
    initializeAdminPanel();
    initializeAnimations();
    initializeCountdowns();
    initializeSearch();
    initializeLazyLoading();
    
    // Verifica se está na página de admin
    if (window.location.pathname.includes('admin.html')) {
        checkAdminAuth();
    }
    
    // Ativa links do menu
    activateNavLinks();
    
    // Carrega carros em destaque
    loadFeaturedCars();
}

// =============================================
// NAVEGAÇÃO E MENU
// =============================================

function initializeNavigation() {
    const navbar = document.querySelector(".navbar");
    const logo = document.querySelector(".nav-logo img");
    
    // Efeito de scroll no navbar
    window.addEventListener("scroll", function() {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
    
    // WhatsApp no header (mobile)
    const whatsappHeader = document.querySelector('.whatsapp-header');
    if (whatsappHeader) {
        whatsappHeader.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(this.href, '_blank');
        });
    }
}

function activateNavLinks() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        
        if (currentPath === linkPath) {
            link.classList.add('active');
        }
    });
}

// =============================================
// CARROSSEL PRINCIPAL
// =============================================

function initializeCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (slides.length === 0) return;
    
    // Auto-avanço do carrossel
    const carouselInterval = setInterval(nextSlide, 5000);
    
    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToSlide(index));
    });
    
    // Funções do carrossel
    function nextSlide() {
        updateSlide((currentSlide + 1) % slides.length);
    }
    
    function prevSlide() {
        updateSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
    }
    
    function goToSlide(index) {
        updateSlide(index);
    }
    
    function updateSlide(newIndex) {
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        
        currentSlide = newIndex;
        
        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
    }
}

// =============================================
// CARROS EM DESTAQUE (SUPABASE)
// =============================================

async function loadFeaturedCars() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    
    // Mostra spinner de carregamento
    grid.innerHTML = `
        <div class="col-12 text-center py-4">
            <div class="spinner-border text-warning" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
        </div>
    `;
    
    try {
        const { data, error } = await supabase
            .from('cars')
            .select('id, title, short_description, price, cover_image_url, km, year')
            .eq('is_active', true)
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) throw error;
        
        grid.innerHTML = '';
        
        if (data.length === 0) {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">Nenhum carro em destaque no momento.</div>
                </div>
            `;
            return;
        }
        
        // Cria os cards dos carros
        data.forEach(car => {
            const card = document.createElement('div');
            card.className = 'featured-card';
            card.innerHTML = `
                <a href="detalhes.html?id=${car.id}" style="text-decoration: none; color: inherit;">
                    <div class="featured-image">
                        <img src="${car.cover_image_url || 'assets/images/placeholder.jpg'}" 
                             alt="${car.title}" 
                             loading="lazy">
                    </div>
                    <div class="featured-info">
                        <h4>${car.title}</h4>
                        <div class="car-meta">
                            <span class="badge bg-light text-dark">${car.km} km</span>
                            <span class="badge bg-light text-dark">${car.year}</span>
                        </div>
                        <p>${car.short_description}</p>
                        <span class="price">${formatPrice(car.price)}</span>
                    </div>
                </a>
            `;
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Erro ao carregar carros em destaque:', error);
        grid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    Ocorreu um erro ao carregar os veículos em destaque.
                </div>
            </div>
        `;
    }
}

// Formata o preço corretamente (divindo por 100)
function formatPrice(price) {
    const priceNumber = Number(price) / 100;
    return priceNumber.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// =============================================
// FILTROS E PESQUISA
// =============================================

function initializeFilters() {
    const marcaFilter = document.getElementById('marca-filter');
    const anoFilter = document.getElementById('ano-filter');
    const precoFilter = document.getElementById('preco-filter');
    const clearButton = document.querySelector('.filter-clear');
    
    if (marcaFilter) marcaFilter.addEventListener('change', applyFilters);
    if (anoFilter) anoFilter.addEventListener('change', applyFilters);
    if (precoFilter) precoFilter.addEventListener('change', applyFilters);
    if (clearButton) clearButton.addEventListener('click', clearFilters);
}

function applyFilters() {
    // Implementação dos filtros...
}

function clearFilters() {
    // Limpa os filtros...
}

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
}

function handleSearch(e) {
    // Implementação da pesquisa...
}

// =============================================
// MODAIS E INTERAÇÕES
// =============================================

function initializeVideoModal() {
    // Implementação do modal de vídeo...
}

function initializeAdminPanel() {
    // Implementação do painel admin...
}

// =============================================
// ANIMAÇÕES E EFEITOS
// =============================================

function initializeAnimations() {
    // Configura animações de scroll...
}

function initializeCountdowns() {
    // Configura contadores regressivos...
}

// =============================================
// FUNÇÕES UTILITÁRIAS
// =============================================

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function initializeLazyLoading() {
    // Implementação do lazy loading...
}

// =============================================
// MANIPULAÇÃO DE ERROS
// =============================================

window.addEventListener('error', function(e) {
    console.error('Erro JavaScript:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Rejeição não tratada:', e.reason);
});