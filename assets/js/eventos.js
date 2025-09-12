import { supabase } from "./supabaseClient.js";

// Aguardar o carregamento completo do DOM
document.addEventListener("DOMContentLoaded", function () {
  // Verificar se o Supabase está carregado
  if (typeof window.supabase === "undefined") {
    console.error("Supabase não foi carregado corretamente");
    showError("Erro ao carregar a biblioteca do banco de dados");
    return;
  }

  // Carregar eventos
  carregarEventos(supabase);
});

// Função para mostrar erro
function showError(message) {
  const upcomingContainer = document.getElementById("upcoming-events");
  const pastContainer = document.getElementById("past-events");

  if (upcomingContainer) {
    upcomingContainer.innerHTML = `
            <div class="no-events-container">
                <div class="no-events-image">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2"/>
                        <path d="M70 35H30a5 5 0 0 0-5 5v30a5 5 0 0 0 5 5h40a5 5 0 0 0 5-5V40a5 5 0 0 0-5-5zm-40 5h40v5H30v-5zm40 30H30V50h40v20z" fill="#6c757d"/>
                        <circle cx="50" cy="25" r="5" fill="#6c757d"/>
                        <text x="50" y="85" text-anchor="middle" fill="#6c757d" font-size="12">${message}</text>
                    </svg>
                </div>
                <p class="no-events-message">Ops! Algo deu errado ao carregar os eventos.</p>
                <button class="retry-btn" onclick="window.location.reload()">Tentar Novamente</button>
            </div>
        `;
  }

  if (pastContainer) {
    pastContainer.innerHTML = `<p class="error">${message}</p>`;
  }

  console.error(message);
}

// Função para formatar data
function formatarData(data) {
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(data).toLocaleDateString("pt-BR", options).toUpperCase();
}

// Função para formatar hora
function formatarHora(hora) {
  return hora ? hora.substring(0, 5) : "";
}

// Função para carregar eventos
async function carregarEventos(supabase) {
  try {
    // Buscar todos os eventos ativos ordenados por data
    const { data: eventos, error } = await supabase
      .from("eventos")
      .select("*")
      .eq("status", "ativo")
      .order("data_evento", { ascending: true });

    if (error) {
      throw error;
    }

    if (eventos && eventos.length > 0) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Separar eventos futuros e passados
      const eventosFuturos = eventos.filter((evento) => {
        const dataEvento = new Date(evento.data_evento);
        return dataEvento >= hoje;
      });

      const eventosPassados = eventos
        .filter((evento) => {
          const dataEvento = new Date(evento.data_evento);
          return dataEvento < hoje;
        })
        .reverse(); // Ordenar do mais recente para o mais antigo

      // Exibir eventos futuros
      const upcomingContainer = document.getElementById("upcoming-events");
      if (eventosFuturos.length > 0) {
        upcomingContainer.innerHTML = eventosFuturos
          .map(
            (evento) => `
                    <div class="event-card upcoming">
                        <div class="event-image">
                            ${
                              evento.imagem_url
                                ? `<img src="${evento.imagem_url}" alt="${evento.titulo}">`
                                : `<div class="placeholder-image eventos-placeholder">Sem imagem</div>`
                            }
                        </div>
                        <div class="event-info">
                            <div class="event-date">${formatarData(
                              evento.data_evento
                            )}</div>
                            <h3>${evento.titulo}</h3>
                            <p>${evento.descricao}</p>
                            <div class="event-details">
                                <span class="location">📍 ${
                                  evento.localizacao
                                }</span>
                                ${
                                  evento.hora_inicio
                                    ? `<span class="time">🕐 ${formatarHora(
                                        evento.hora_inicio
                                      )} - ${formatarHora(
                                        evento.hora_fim
                                      )}</span>`
                                    : ""
                                }
                            </div>
                            <button class="event-btn">Saiba Mais</button>
                        </div>
                    </div>
                `
          )
          .join("");
      } else {
        // Exibir mensagem personalizada quando não há eventos futuros
        upcomingContainer.innerHTML = `
                    <div class="no-events-container">
                        <div class="no-events-image">
                            <img src="https://i.ibb.co/pD6brKy/embreve.png" alt="Nenhum Evento Previsto">
                        </div>
                        <h3 class="no-events-title">Nenhum Evento Previsto</h3>
                        <p class="no-events-message">Estamos preparando novidades incríveis para você!</p>
                        
                        <div class="no-events-actions">
                            
                            <a href="https://wa.me/5561985804280" class="whatsapp-suggestion" target="_blank">
                                <i class="fab fa-whatsapp"></i> Sugerir um evento
                            </a>
                        </div>
                    </div>
                `;
      }

      // Exibir eventos passados
      const pastContainer = document.getElementById("past-events");
      if (eventosPassados.length > 0) {
        pastContainer.innerHTML = eventosPassados
          .map(
            (evento) => `
                    <div class="timeline-item">
                        <div class="timeline-date">${new Date(
                          evento.data_evento
                        )
                          .toLocaleDateString("pt-BR", {
                            month: "short",
                            year: "numeric",
                          })
                          .toUpperCase()}</div>
                        <div class="timeline-content">
                            <div class="event-card past">
                                <div class="event-image">
                                    ${
                                      evento.imagem_url
                                        ? `<img src="${evento.imagem_url}" alt="${evento.titulo}">`
                                        : `<div class="placeholder-image eventos-placeholder">Sem imagem</div>`
                                    }
                                </div>
                                <div class="event-info">
                                    <h3>${evento.titulo}</h3>
                                    <p>${evento.descricao}</p>
                                    <div class="event-stats">
                                        ${
                                          evento.participantes_estimados
                                            ? `<span>👥 ${evento.participantes_estimados}+ participantes</span>`
                                            : ""
                                        }
                                        ${
                                          evento.veiculos_estimados
                                            ? `<span>🚗 ${evento.veiculos_estimados}+ veículos</span>`
                                            : ""
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `
          )
          .join("");
      } else {
        pastContainer.innerHTML = `
                    <div class="no-events-container">
                        <div class="no-events-image">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2"/>
                                <path d="M70 35H30a5 5 0 0 0-5 5v30a5 5 0 0 0 5 5h40a5 5 0 0 0 5-5V40a5 5 0 0 0-5-5zm-40 5h40v5H30v-5zm40 30H30V50h40v20z" fill="#6c757d"/>
                                <circle cx="50" cy="25" r="5" fill="#6c757d"/>
                                <text x="50" y="85" text-anchor="middle" fill="#6c757d" font-size="12">Sem histórico</text>
                            </svg>
                        </div>
                        <p class="no-events-message">Nenhum evento passado encontrado.</p>
                    </div>
                `;
      }
    } else {
      // Exibir mensagem quando não há eventos
      document.getElementById("upcoming-events").innerHTML = `
                <div class="no-events-container">
                    <div class="no-events-image">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2"/>
                            <path d="M70 35H30a5 5 0 0 0-5 5v30a5 5 0 0 0 5 5h40a5 5 0 0 0 5-5V40a5 5 0 0 0-5-5zm-40 5h40v5H30v-5zm40 30H30V50h40v20z" fill="#6c757d"/>
                            <circle cx="50" cy="25" r="5" fill="#6c757d"/>
                            <line x1="30" y1="60" x2="70" y2="60" stroke="#6c757d" stroke-width="2"/>
                        </svg>
                    </div>
                    <h3 class="no-events-title">Nenhum Evento no Momento</h3>
                    <p class="no-events-message">Estamos preparando uma programação especial para você!</p>
                    <div class="no-events-actions">
                        <button class="subscribe-btn" onclick="alert('Funcionalidade de inscrição em breve!')">
                            <i class="fas fa-bell"></i> Quero ser notificado sobre eventos
                        </button>
                    </div>
                </div>
            `;

      document.getElementById("past-events").innerHTML = `
                <div class="no-events-container">
                    <div class="no-events-image">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2"/>
                            <path d="M70 35H30a5 5 0 0 0-5 5v30a5 5 0 0 0 5 5h40a5 5 0 0 0 5-5V40a5 5 0 0 0-5-5zm-40 5h40v5H30v-5zm40 30H30V50h40v20z" fill="#6c757d"/>
                            <circle cx="50" cy="25" r="5" fill="#6c757d"/>
                            <text x="50" y="85" text-anchor="middle" fill="#6c757d" font-size="12">Sem histórico</text>
                        </svg>
                    </div>
                    <p class="no-events-message">Nenhum evento passado encontrado.</p>
                </div>
            `;
    }
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);
    showError(
      "Erro ao carregar eventos. Verifique o console para mais detalhes."
    );
  }
}
