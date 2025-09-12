import { supabase } from "./supabaseClient.js";

// Função para mostrar erros na página
function showError(message) {
  const container = document.getElementById("videos-container");
  if (container) {
    container.innerHTML = `<div class="error" style="color: red; padding: 20px; border: 1px solid red;">${message}</div>`;
  }
  console.error(message);
}

document.addEventListener("DOMContentLoaded", async () => {

try {
    if (!supabase) {
      throw new Error("Biblioteca Supabase não carregou corretamente");
    }
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      showError("Erro ao buscar vídeos: " + error.message);
      return;
    }

    if (error) throw new Error(`Erro Supabase: ${error.message}`);
    
    // Agora sim carrega os vídeos
    await loadVideos();
    setupVideoModal();
  } catch (err) {
    showError(`Falha crítica: ${err.message}`);
    console.error("Erro completo:", err);
  }
});

async function loadVideos() {
  const container = document.getElementById("videos-container");
  if (!container) {
    console.error("Container de vídeos não encontrado");
    return;
  }

  container.innerHTML = '<div class="loading">Carregando vídeos...</div>';

  try {
    const { data: videos, error } = await supabase
      .from("videos")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    if (!videos || videos.length === 0) {
      container.innerHTML =
        '<div class="no-videos">Nenhum vídeo disponível no momento.</div>';
      return;
    }

    container.innerHTML = "";

    videos.forEach((video) => {
      const videoId = extractYoutubeId(video.youtube_url);
      if (!videoId) {
        console.error("URL do YouTube inválida:", video.youtube_url);
        return;
      }

      const thumbnailUrl =
        video.thumbnail_url ||
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      const videoCard = document.createElement("div");
      videoCard.className = "video-card";
      videoCard.dataset.videoId = videoId;

      videoCard.innerHTML = `
                <div class="video-thumbnail">
                    <img src="${thumbnailUrl}" alt="${
        video.title
      }" loading="lazy">
                    <div class="play-button">▶</div>
                </div>
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <p>${video.description}</p>
                    <span class="video-duration">${video.duration || ""}</span>
                </div>
            `;

      container.appendChild(videoCard);

      videoCard.addEventListener("click", () => openVideoModal(videoId));
    });
  } catch (err) {
    console.error("Erro ao carregar vídeos:", err);
    container.innerHTML =
      '<div class="error">Erro ao carregar vídeos. Tente novamente mais tarde.</div>';
  }
}

function setupVideoModal() {
  const modal = document.getElementById("video-modal");
  if (!modal) {
    console.error("Modal não encontrado");
    return;
  }

  const closeBtn = modal.querySelector(".close-modal");
  if (!closeBtn) {
    console.error("Botão de fechar não encontrado");
    return;
  }

  closeBtn.addEventListener("click", () => {
    const iframe = document.getElementById("youtube-iframe");
    if (iframe) iframe.src = "";
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      const iframe = document.getElementById("youtube-iframe");
      if (iframe) iframe.src = "";
      modal.style.display = "none";
    }
  });
}

function openVideoModal(videoId) {
  const modal = document.getElementById("video-modal");
  const iframe = document.getElementById("youtube-iframe");

  if (!modal || !iframe) {
    console.error("Modal ou iframe não encontrado");
    return;
  }

  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  modal.style.display = "block";
}

function extractYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
