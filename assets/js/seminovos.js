import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://wthcwllhzbahvnnjqlko.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aGN3bGxoemJhaHZubmpxbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTk5NjMsImV4cCI6MjA3MDA5NTk2M30.7uzMcp8NsyxYuMmN7nnbBB0dJITJ_C7O7Ck0HFQgbOA";

const supabase = createClient(supabaseUrl, supabaseKey);

// Objeto para armazenar os filtros atuais
const currentFilters = {
  marca: null,
  ano: null,
  preco: null,
  termoBusca: null,
};

// Função para formatar o preço corretamente (agora dividindo por 100)
function formatarPreco(valor) {
  // Converte para número e divide por 100 para corrigir os centavos
  const valorCorrigido = Number(valor) / 100;

  // Formata como moeda brasileira
  return valorCorrigido.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function configurarBusca() {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");

  // Busca ao clicar no ícone
  searchButton.addEventListener("click", () => {
    currentFilters.termoBusca = searchInput.value.trim() || null;
    carregarVeiculos();
  });

  // Busca ao pressionar Enter
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      currentFilters.termoBusca = searchInput.value.trim() || null;
      carregarVeiculos();
    }
  });

  // Busca após parar de digitar (debounce)
  let timeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      currentFilters.termoBusca = searchInput.value.trim() || null;
      carregarVeiculos();
    }, 500); // 500ms de atraso após parar de digitar
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const filterToggle = document.querySelector(".mobile-filter-toggle");
  const filtersContainer = document.querySelector(".filters-container");

  if (filterToggle && filtersContainer) {
    filterToggle.addEventListener("click", function () {
      filtersContainer.classList.toggle("active");
    });
  }
});

// Função para aplicar os filtros à query
function aplicarFiltros(query) {
  // Filtro por termo de busca (busca em múltiplos campos)
  if (currentFilters.termoBusca) {
    const searchTerm = `%${currentFilters.termoBusca}%`;
    query = query.or(
      `title.ilike.${searchTerm},brand.ilike.${searchTerm},short_description.ilike.${searchTerm}`
    );
  }
  // Filtro por marca (corrigido para usar 'make' ou 'brand' conforme seu banco)
  if (currentFilters.marca) {
    query = query.ilike("brand", `%${currentFilters.marca}%`); // ou .eq('brand', currentFilters.marca)
  }

  // Filtro por ano
  if (currentFilters.ano) {
    const [inicio, fim] = currentFilters.ano.split("-").map(Number);
    query = query.gte("year", inicio);
    if (fim) query = query.lte("year", fim);
  }

  // Filtro por preço (ajustado para trabalhar com os valores originais do banco)
  if (currentFilters.preco) {
    if (currentFilters.preco === "0-30000") {
      query = query.lte("price", 3000000); // 30.000,00 * 100
    } else if (currentFilters.preco === "30000-60000") {
      query = query.gte("price", 3000000).lte("price", 6000000);
    } else if (currentFilters.preco === "60000-100000") {
      query = query.gte("price", 6000000).lte("price", 10000000);
    } else if (currentFilters.preco === "100000+") {
      query = query.gte("price", 10000000);
    }
  }

  return query;
}

// Função para renderizar os veículos na tela
function renderizarVeiculos(veiculos) {
  const container = document.getElementById("vehicles-container");

  if (veiculos.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          Nenhum veículo encontrado com os filtros selecionados.
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  veiculos.forEach((vehicle) => {
    const gallery = vehicle.gallery_urls || [];
    const carouselId = `carousel-${vehicle.id}`;

    // Cria os slides das imagens
    const imagesHtml = gallery
      .map(
        (url, index) => `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <img src="${url}" class="d-block w-100" alt="${
          vehicle.title
        }" style="height:250px; object-fit:cover;">
      </div>
    `
      )
      .join("");

    // Cria os indicadores
    const indicatorsHtml = gallery
      .map(
        (_, index) => `
      <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" 
        ${
          index === 0 ? 'class="active" aria-current="true"' : ""
        } aria-label="Slide ${index + 1}">
      </button>
    `
      )
      .join("");

    // Monta o card
    const cardHtml = `
  <div class="col-12 col-md-4 mb-3 px-0 px-md-2">
    <div class="card shadow-sm rounded-0 rounded-md-3 w-100 h-100">
      <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-indicators">
              ${indicatorsHtml}
            </div>
            <div class="carousel-inner">
              ${imagesHtml}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Anterior</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Próximo</span>
            </button>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${vehicle.title}</h5>
            <p class="card-text">${vehicle.short_description}</p>
            <div class="d-flex gap-2 mb-2">
              <span class="badge bg-light text-dark">${vehicle.km} km</span>
              <span class="badge bg-light text-dark">${vehicle.year}</span>
            </div>
            <h5 class="text-warning mt-auto">${formatarPreco(
              vehicle.price
            )}</h5>
            <a href="detalhes.html?id=${
              vehicle.id
            }" class="btn btn-warning w-100 mt-2">Ver Detalhes</a>
          </div>
        </div>
      </div>
    `;

    container.innerHTML += cardHtml;
  });
}

// No final da função renderizarVeiculos()
if (window.innerWidth <= 768) {
  document.querySelectorAll(".card").forEach((card) => {
    card.style.width = "100vw";
    card.style.marginLeft = `-${window.scrollX}px`;
  });
}

window.addEventListener("resize", () => {
  if (window.innerWidth <= 768) {
    document.querySelectorAll(".card").forEach((card) => {
      card.style.width = "100vw";
      card.style.marginLeft = `-${window.scrollX}px`;
    });
  } else {
    document.querySelectorAll(".card").forEach((card) => {
      card.style.width = "";
      card.style.marginLeft = "";
    });
  }
});

// Função principal para carregar os veículos
async function carregarVeiculos() {
  const container = document.getElementById("vehicles-container");

  // Mostra um spinner de carregamento
  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-warning" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-2">Carregando veículos...</p>
    </div>
  `;

  try {
    // Cria a query base
    let query = supabase
      .from("cars")
      .select("*")
      .eq("category", "seminovo")
      .eq("is_active", true);

    // Aplica os filtros
    query = aplicarFiltros(query);

    // Ordena por data de criação
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Renderiza os veículos
    renderizarVeiculos(data || []);
  } catch (error) {
    console.error("Erro ao buscar veículos:", error);
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          Ocorreu um erro ao carregar os veículos. Por favor, tente novamente.
        </div>
      </div>
    `;
  }
}

// Função para carregar as marcas no select
async function carregarMarcas() {
  const { data, error } = await supabase
    .from("cars") // tabela
    .select("brand")
    .order("brand", { ascending: true }); // ordena

  if (error) {
    console.error("Erro ao buscar marcas:", error);
    return;
  }

  // Usa Set para remover duplicados no lado do cliente
  const marcasUnicas = [...new Set(data.map((item) => item.brand))];

  const select = document.getElementById("marca-filter");

  marcasUnicas.forEach((marca) => {
    if (marca) {
      const option = document.createElement("option");
      option.value = marca;
      option.textContent = marca;
      select.appendChild(option);
    }
  });
}

// Configura os event listeners para os filtros
function configurarFiltros() {
  // Filtro por marca
  document.getElementById("marca-filter").addEventListener("change", (e) => {
    currentFilters.marca = e.target.value || null;
    carregarVeiculos();
  });

  // Filtro por ano
  document.getElementById("ano-filter").addEventListener("change", (e) => {
    currentFilters.ano = e.target.value || null;
    carregarVeiculos();
  });

  // Filtro por preço
  document.getElementById("preco-filter").addEventListener("change", (e) => {
    currentFilters.preco = e.target.value || null;
    carregarVeiculos();
  });

  // Botão limpar filtros
  document.querySelector(".filter-clear").addEventListener("click", () => {
    document.getElementById("marca-filter").value = "";
    document.getElementById("ano-filter").value = "";
    document.getElementById("preco-filter").value = "";

    currentFilters.marca = null;
    currentFilters.ano = null;
    currentFilters.preco = null;

    carregarVeiculos();
  });
}

// Inicializa tudo quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  // Chama a função quando a página carregar
  configurarFiltros();
  carregarVeiculos();
  configurarBusca();
  carregarMarcas();
});
