import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://wthcwllhzbahvnnjqlko.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aGN3bGxoemJhaHZubmpxbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTk5NjMsImV4cCI6MjA3MDA5NTk2M30.7uzMcp8NsyxYuMmN7nnbBB0dJITJ_C7O7Ck0HFQgbOA";
const supabase = createClient(supabaseUrl, supabaseKey);

const botaoNotif = document.getElementById("ativarNotificacoes");
const iconeSino = document.getElementById("iconeSino");

async function subscribeUser() {
  console.log("Clicou no sino");

  try {
    const registration = await navigator.serviceWorker.ready;
    console.log("Service Worker pronto:", registration);

    // Verifica se já existe uma subscription
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Desinscrever do Push
      await subscription.unsubscribe();
      console.log("Usuário desinscrito");

      // Atualiza no Supabase: is_active = false
      await supabase
        .from("push_subscriptions")
        .update({ is_active: false })
        .eq("endpoint", subscription.endpoint);

      iconeSino.className = "fa-regular fa-bell"; // sino vazio
      return;
    }

    // Solicita permissão
    const permission = await Notification.requestPermission();
    console.log("Permissão de notificação:", permission);

    if (permission !== "granted") {
      alert("Permissão negada para notificações.");
      return;
    }

    // Cria inscrição
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        "BADK4NkBEFaIpNDPiCDPybf-8j2NZkJHo3np9g5L19hQ1OcXeUJCRl33TRTMCF-s4CBNu7PVe6nfOojVonQMuUM"
      ),
    });

    console.log("Usuário inscrito:", subscription);

    // Salva no Supabase
    await supabase.from("push_subscriptions").upsert(
      {
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
        auth: arrayBufferToBase64(subscription.getKey("auth")),
        is_active: true,
      },
      { onConflict: ["endpoint"] }
    );

    iconeSino.className = "fa-solid fa-bell"; // sino cheio
    console.log("Inscrição registrada no Supabase!");
  } catch (err) {
    console.error("Erro no subscribe:", err);
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// Ao carregar a página, verifica se já existe inscrição ativa
async function checkSubscription() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    console.log("Usuário não está inscrito");
    iconeSino.className = "fa-regular fa-bell"; // sino vazio
    return;
  }

  // Converter para JSON antes de acessar p256dh e auth
  const subJson = subscription.toJSON();
  console.log("Inscrição encontrada:", subJson);

  iconeSino.className = "fa-solid fa-bell"; // sino cheio
}

// Eventos
botaoNotif?.addEventListener("click", subscribeUser);
window.addEventListener("load", checkSubscription);
