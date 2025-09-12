// Carrega Supabase via CDN
const supabaseUrl = "https://wthcwllhzbahvnnjqlko.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aGN3bGxoemJhaHZubmpxbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTk5NjMsImV4cCI6MjA3MDA5NTk2M30.7uzMcp8NsyxYuMmN7nnbBB0dJITJ_C7O7Ck0HFQgbOA";

// Variáveis globais
let lightboxSwiper = null;
let currentImageIndex = 0;
window.carData = null;

// Inicializa Supabase
document.addEventListener("DOMContentLoaded", function () {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  script.onload = function () {
    window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    initApp();
  };
  document.head.appendChild(script);
});

function initApp() {
  const params = new URLSearchParams(window.location.search);
  const carId = params.get("id");

  // Lightbox functionality
  const lightbox = document.getElementById("imageLightbox");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrice = document.getElementById("lightboxPrice");
  const lightboxWhatsapp = document.getElementById("lightboxWhatsapp");
  const lightboxGallery = document.getElementById("lightbox-gallery");

  // Share functionality
  const shareButton = document.getElementById("shareButton");
  const lightboxShare = document.getElementById("lightboxShare");
  const shareOptions = document.getElementById("shareOptions");

  console.log("Elementos do lightbox:", {
    lightbox: !!lightbox,
    lightboxClose: !!lightboxClose,
    lightboxPrice: !!lightboxPrice,
    lightboxWhatsapp: !!lightboxWhatsapp,
    lightboxGallery: !!lightboxGallery,
    shareButton: !!shareButton,
    lightboxShare: !!lightboxShare,
    shareOptions: !!shareOptions
  });

  // Função para abrir o lightbox com carrossel
  function openLightbox(imageIndex = 0) {
    if (lightbox && lightboxGallery) {
      currentImageIndex = imageIndex;

      // Preenche o carrossel do lightbox com todas as imagens
      lightboxGallery.innerHTML = "";

      if (
        window.carData &&
        Array.isArray(window.carData.gallery_urls) &&
        window.carData.gallery_urls.length > 0
      ) {
        window.carData.gallery_urls.forEach((url, index) => {
          const slide = document.createElement("div");
          slide.classList.add("swiper-slide");

          const img = document.createElement("img");
          img.src = url;
          img.alt = window.carData.title;
          img.loading = "eager";
          img.style.cursor = "pointer";

          // Permite zoom na imagem ao clicar
          img.addEventListener("click", function (e) {
            e.stopPropagation();
            if (lightboxSwiper && lightboxSwiper.zoom) {
              if (lightboxSwiper.zoomed) {
                lightboxSwiper.zoom.out();
              } else {
                lightboxSwiper.zoom.in();
              }
            }
          });

          slide.appendChild(img);
          lightboxGallery.appendChild(slide);
        });
      } else {
        // Imagem padrão caso não haja galeria
        const slide = document.createElement("div");
        slide.classList.add("swiper-slide");

        const img = document.createElement("img");
        img.src = "/assets/images/no-image.jpg";
        img.alt = "Imagem não disponível";
        img.style.cursor = "pointer";

        slide.appendChild(img);
        lightboxGallery.appendChild(slide);
      }

      // Inicializa ou atualiza o Swiper do lightbox
      setTimeout(() => {
        if (lightboxSwiper) {
          lightboxSwiper.destroy();
        }

        lightboxSwiper = new Swiper("#lightbox-swiper", {
          initialSlide: currentImageIndex,
          loop: true,
          pagination: {
            el: ".lightbox-pagination",
            clickable: true,
          },
          navigation: {
            nextEl: ".lightbox-button-next",
            prevEl: ".lightbox-button-prev",
          },
          keyboard: {
            enabled: true,
            onlyInViewport: true,
          },
          zoom: {
            maxRatio: 3,
            toggle: true,
          },
          on: {
            init: function () {
              lightbox.classList.add("active");
              document.body.style.overflow = "hidden";
              
              // Reposiciona o menu de share quando o lightbox abre
              if (shareOptions) {
                shareOptions.style.position = 'fixed';
                shareOptions.style.zIndex = '10010';
              }
            },
          },
        });
      }, 100);
    }
  }

  // Função para fechar o lightbox
  function closeLightbox() {
    const lightbox = document.getElementById("imageLightbox");
    if (lightbox) {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";

      // Destroi o Swiper do lightbox para liberar memória
      if (lightboxSwiper) {
        lightboxSwiper.destroy();
        lightboxSwiper = null;
      }
      
      // Reseta o posicionamento do menu de share
      if (shareOptions) {
        shareOptions.removeAttribute('style');
        shareOptions.classList.remove("active");
      }
    }
  }

  // Lightbox event handlers
  if (lightboxClose) {
    lightboxClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Evento de tecla ESC para fechar lightbox
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      lightbox &&
      lightbox.classList.contains("active")
    ) {
      closeLightbox();
    }
  });

  // Configuração dos botões de compartilhar - CORREÇÃO COMPLETA
  function setupShareButton(button, isLightbox = false) {
    if (button) {
      button.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Para o botão dentro do lightbox, reposiciona o menu
        if (isLightbox && shareOptions) {
          const rect = button.getBoundingClientRect();
          shareOptions.style.position = 'fixed';
          shareOptions.style.zIndex = '10010';
          shareOptions.style.top = (rect.bottom + 10) + 'px';
          shareOptions.style.left = (rect.left - 100) + 'px';
        }
        
        shareOptions.classList.toggle("active");
      });
    }
  }

  // Configura ambos os botões
  setupShareButton(shareButton, false);
  setupShareButton(lightboxShare, true);

  // Fecha o menu de share ao clicar fora
  document.addEventListener("click", function(e) {
    if (shareOptions && shareOptions.classList.contains("active")) {
      const isShareButton = e.target.closest('#shareButton') || e.target.closest('#lightboxShare');
      const isShareOption = e.target.closest('.share-option');
      const isInsideShareOptions = shareOptions.contains(e.target);
      
      if (!isShareButton && !isShareOption && !isInsideShareOptions) {
        shareOptions.classList.remove("active");
      }
    }
  });

  // Share options functionality
  document.querySelectorAll(".share-option").forEach((option) => {
    option.addEventListener("click", function(e) {
      e.stopPropagation();
      const platform = option.getAttribute("data-platform");
      shareAnnouncement(platform);
      shareOptions.classList.remove("active");
    });
  });

  function shareAnnouncement(platform) {
    const titleElement = document.getElementById("car-title");
    const priceElement = document.getElementById("car-price");

    if (!titleElement || !priceElement) {
      console.error("Elementos não encontrados para compartilhamento");
      return;
    }

    const title = titleElement.textContent;
    const price = priceElement.textContent;
    const url = window.location.href;
    const text = `Confira este veículo: ${title} - ${price} | UP7 Antigos`;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "whatsapp":
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          window.location.href = whatsappUrl;
        } else {
          window.open(whatsappUrl, "_blank");
        }
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + "\n\n" + url)}`;
        break;
      case "link":
        navigator.clipboard.writeText(url).then(() => {
          alert("Link copiado para a área de transferência!");
        });
        break;
    }
  }

  async function loadCarDetails() {
    if (!carId) {
      console.error("ID do carro não encontrado na URL");
      return;
    }

    if (!window.supabase) {
      console.error("Supabase não inicializado");
      return;
    }

    // Carrega detalhes do carro atual
    const { data: carData, error: carError } = await window.supabase
      .from("cars")
      .select("*")
      .eq("id", carId)
      .single();

    if (carError) {
      console.error("Erro ao buscar veículo:", carError);
      return;
    }

    // Salva os dados do carro globalmente
    window.carData = carData;

    const priceNumber = Number(carData.price) / 100;
    const formattedPrice = `R$ ${priceNumber.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const priceElement = document.getElementById("car-price");
    if (priceElement) {
      priceElement.textContent = formattedPrice;
    }

    if (lightboxPrice) {
      lightboxPrice.textContent = formattedPrice;
    }

    // Preenche os dados do carro
    const titleElement = document.getElementById("car-title");
    const yearElement = document.getElementById("car-year");
    const descriptionElement = document.getElementById("car-description");

    if (titleElement) titleElement.textContent = carData.title;
    if (yearElement) yearElement.textContent = `Ano: ${carData.year}`;
    if (descriptionElement)
      descriptionElement.textContent =
        carData.detailed_description || "Descrição não disponível";

    // Preenche características
    const featuresContainer = document.getElementById("car-features");
    if (featuresContainer) {
      featuresContainer.innerHTML = "";

      const features = [
        {
          icon: "fas fa-tachometer-alt",
          label: "Quilometragem",
          value: carData.km ? `${carData.km} km` : "Não informada",
        },
        {
          icon: "fas fa-paint-brush",
          label: "Cor",
          value: carData.color || "Não informada",
        },
        {
          icon: "fas fa-gas-pump",
          label: "Combustível",
          value: carData.fuel_type || "Não informado",
        },
        {
          icon: "fas fa-cog",
          label: "Câmbio",
          value: carData.transmission || "Não informado",
        },
        {
          icon: "fas fa-car",
          label: "Versão",
          value: carData.version ? `${carData.version}` : "Não informado",
        },
        {
          icon: "fas fa-tag",
          label: "Marca",
          value: carData.brand || "Não informada",
        },
      ];

      features.forEach((feat) => {
        const featureItem = document.createElement("div");
        featureItem.className = "feature-item";
        featureItem.innerHTML = `
                <div class="feature-icon"><i class="${feat.icon}"></i></div>
                <div class="feature-info">
                    <span class="feature-label">${feat.label}</span>
                    <span class="feature-value">${feat.value}</span>
                </div>
                `;
        featuresContainer.appendChild(featureItem);
      });
    }

    // Galeria de imagens principal
    const gallery = document.getElementById("car-gallery");
    if (gallery) {
      gallery.innerHTML = "";

      if (
        Array.isArray(carData.gallery_urls) &&
        carData.gallery_urls.length > 0
      ) {
        carData.gallery_urls.forEach((url, index) => {
          const slide = document.createElement("div");
          slide.classList.add("swiper-slide");
          const img = document.createElement("img");
          img.src = url;
          img.alt = carData.title;
          img.loading = "lazy";
          img.style.cursor = "pointer";

          // Evento de clique para abrir lightbox com o índice da imagem
          img.addEventListener("click", () => {
            openLightbox(index);
          });

          slide.appendChild(img);
          gallery.appendChild(slide);
        });
      } else {
        // Imagem padrão caso não haja galeria
        const slide = document.createElement("div");
        slide.classList.add("swiper-slide");
        const img = document.createElement("img");
        img.src = "/assets/images/no-image.jpg";
        img.alt = "Imagem não disponível";
        img.style.cursor = "pointer";

        img.addEventListener("click", () => {
          openLightbox(0);
        });

        slide.appendChild(img);
        gallery.appendChild(slide);
      }

      // Inicializa o Swiper da galeria principal
      setTimeout(() => {
        if (typeof Swiper !== "undefined") {
          new Swiper("#car-gallery-swiper", {
            loop: true,
            pagination: {
              el: ".swiper-pagination",
              clickable: true,
            },
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },
            autoplay: {
              delay: 5000,
            },
          });
        }
      }, 100);
    }

    // Carrega veículos sugeridos
    loadSuggestedCars(carData.category);
  }

  async function loadSuggestedCars(category) {
    const { data: suggestedCars, error } = await window.supabase
      .from("cars")
      .select("id, title, price, year, cover_image_url")
      .eq("category", category)
      .neq("id", carId)
      .limit(6);

    if (error) {
      console.error("Erro ao buscar veículos sugeridos:", error);
      return;
    }

    const suggestedContainer = document.getElementById("suggested-cars");
    if (suggestedContainer) {
      suggestedContainer.innerHTML = "";

      if (suggestedCars.length === 0) {
        // Carrega outros carros se não encontrar da mesma categoria
        const { data: fallbackCars } = await window.supabase
          .from("cars")
          .select("id, title, price, year, cover_image_url")
          .neq("id", carId)
          .limit(6);

        fallbackCars.forEach((car) =>
          createSuggestedCard(car, suggestedContainer)
        );
      } else {
        suggestedCars.forEach((car) =>
          createSuggestedCard(car, suggestedContainer)
        );
      }

      // Inicializa o Swiper de sugestões
      setTimeout(() => {
        if (typeof Swiper !== "undefined") {
          new Swiper(".suggested-swiper", {
            slidesPerView: "auto",
            spaceBetween: 15,
            freeMode: {
              enabled: true,
              momentumRatio: 0.5,
              sticky: true,
            },
            navigation: {
              nextEl: ".suggested-swiper .swiper-button-next",
              prevEl: ".suggested-swiper .swiper-button-prev",
            },
            mousewheel: {
              forceToAxis: true,
            },
            breakpoints: {
              768: {
                spaceBetween: 20,
                freeMode: {
                  momentumRatio: 0.8,
                },
              },
            },
          });
        }
      }, 100);
    }
  }

  function createSuggestedCard(car, container) {
    const priceNumber = Number(car.price) / 100;
    const formattedPrice = priceNumber.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const slide = document.createElement("div");
    slide.className = "swiper-slide suggested-slide";
    slide.innerHTML = `
            <a href="detalhes.html?id=${car.id}" class="suggested-link">
                <div class="suggested-card">
                    <img src="${
                      car.cover_image_url || "/assets/images/no-image.jpg"
                    }" alt="${car.title}" class="suggested-img">
                    <div class="suggested-info">
                        <h3>${car.title}</h3>
                        <div class="suggested-meta">
                            <span>${car.year}</span>
                            <span class="suggested-price">R$ ${formattedPrice}</span>
                        </div>
                    </div>
                </div>
            </a>
        `;
    container.appendChild(slide);
  }

  // Configura botão do WhatsApp
  document
    .querySelector(".btn-whatsapp")
    ?.addEventListener("click", function () {
      const titleElement = document.getElementById("car-title");
      if (!titleElement) return;

      const phone = "5561985804280";
      const message = `Olá, estou interessado no veículo ${titleElement.textContent}`;
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    });

  // Configura botão do WhatsApp no lightbox
  if (lightboxWhatsapp) {
    lightboxWhatsapp.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      
      const titleElement = document.getElementById("car-title");
      if (!titleElement) return;

      const phone = "5561985804280";
      const message = `Olá, estou interessado no veículo ${titleElement.textContent}`;
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    });
  }

  // Configura botão de contato
  document
    .querySelector(".btn-contact")
    ?.addEventListener("click", function () {
      window.location.href =
        "mailto:contato@up7antigos.com.br?subject=Interesse no veículo";
    });

  // Função de teste para verificar se o lightbox funciona
  window.testLightbox = function () {
    console.log("Testando lightbox com carrossel...");

    if (
      window.carData &&
      window.carData.gallery_urls &&
      window.carData.gallery_urls.length > 0
    ) {
      openLightbox(0);
      console.log("✅ Lightbox com carrossel aberto com sucesso!");
    } else {
      console.log(
        "⚠️  Nenhuma imagem encontrada, testando com imagem fallback..."
      );
      openLightbox(0);
    }
  };

  console.log(
    "Função testLightbox disponível. Digite testLightbox() no console para testar."
  );

  // Inicia o carregamento dos dados
  loadCarDetails();
}
