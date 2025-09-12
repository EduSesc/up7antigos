import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", async function () {
  const promoBanner = document.getElementById("promo-banner");
  const promoImage = document.getElementById("promo-image");
  const whatsappLink = document.getElementById("whatsapp-link");
  const closeBtn = document.getElementById("close-btn");
  const body = document.body;

  // Carregar Supabase via CDN (sem import)
  if (typeof window.supabase === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = initSupabase;
    document.head.appendChild(script);
  } else {
    initSupabase();
  }

  async function initSupabase() {

    try {
      // Buscar promoção válida
      const hoje = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", hoje)
        .gte("end_date", hoje)
        .single();

      if (error) {
        console.log("Erro ao buscar promoção:", error.message);
        return;
      }

      if (data) {
        promoImage.src = data.image_url;
        promoImage.alt = data.alt_text;
        whatsappLink.href = `https://wa.me/5561985804280?text=${encodeURIComponent(data.whatsapp_message)}`;
        
        // Mostrar banner após carregar
        showBanner();
      }
    } catch (error) {
      console.log("Erro:", error);
    }
  }

  function showBanner() {
    // Criar overlay
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    body.appendChild(overlay);

    // Mostrar o banner e overlay após 1.5 segundos
    setTimeout(function () {
      promoBanner.classList.add("show");
      overlay.classList.add("show");
    }, 1500);

    // Event listeners...
    closeBtn.addEventListener("click", closeBanner);
    overlay.addEventListener("click", closeBanner);

    setTimeout(function () {
      if (promoBanner.classList.contains("show")) {
        closeBanner();
      }
    }, 8000);
  }

  function closeBanner() {
    const promoBanner = document.getElementById("promo-banner");
    const overlay = document.querySelector(".overlay");
    
    if (promoBanner) promoBanner.classList.remove("show");
    if (overlay) overlay.classList.remove("show");

    setTimeout(function () {
      if (promoBanner) promoBanner.style.display = "none";
      if (overlay) overlay.style.display = "none";
    }, 500);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".category-card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("show");
          }, index * 300); // atraso para efeito em sequência
        }
      });
    },
    { threshold: 0.2 }
  );

  cards.forEach((card) => observer.observe(card));
});


