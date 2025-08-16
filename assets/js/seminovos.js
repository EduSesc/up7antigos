// Inicializa o cliente Supabase
const supabaseClient = supabase.createClient(
  "https://wthcwllhzbahvnnjqlko.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aGN3bGxoemJhaHZubmpxbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTk5NjMsImV4cCI6MjA3MDA5NTk2M30.7uzMcp8NsyxYuMmN7nnbBB0dJITJ_C7O7Ck0HFQgbOA"
);

// Função para buscar e exibir veículos antigos
async function carregarVeiculosAntigos() {
  const { data, error } = await supabaseClient
    .from("cars")
    .select("*")
    .eq("category", "seminovo") // singular, conforme corrigimos
    .eq("is_active", true)    // boolean verdadeiro
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar veículos:", error);
    return;
  }

  const container = document.getElementById("vehicles-container");
  container.innerHTML = "";

  data.forEach(vehicle => {
    const gallery = vehicle.gallery_urls || [];
    const carouselId = `carousel-${vehicle.id}`;

    // Cria os slides das imagens
    const imagesHtml = gallery.map((url, index) => `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <img src="${url}" class="d-block w-100" alt="${vehicle.title}" style="height:250px; object-fit:cover;">
      </div>
    `).join("");

    // Cria os indicadores (bolinhas)
    const indicatorsHtml = gallery.map((_, index) => `
      <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" 
        ${index === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${index+1}">
      </button>
    `).join("");

    // Monta o card
    const cardHtml = `
      <div class="col-md-4">
        <div class="card shadow-sm rounded-3 mb-4">
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
          <div class="card-body">
            <h5 class="card-title">${vehicle.title}</h5>
            <p class="card-text">${vehicle.short_description}</p>
            <div class="d-flex gap-2 mb-2">
              <span class="badge bg-light text-dark">${vehicle.km} km</span>
              <span class="badge bg-light text-dark">${vehicle.year}</span>
            </div>
            <h5 class="text-warning">R$ ${vehicle.price.toLocaleString()}</h5>
            <a href="detalhes.html?id=${vehicle.id}" class="btn btn-warning w-100 mt-2">Ver Detalhes</a>
          </div>
        </div>
      </div>
    `;

    container.innerHTML += cardHtml;
  });
}

// Executa a função quando a página carregar
document.addEventListener("DOMContentLoaded", carregarVeiculosAntigos);
