/** Real-time: suscripción a nuevas transacciones, sonido y notificación */

import { supabaseClient } from "../api/client.js";
import { showNewTransactionToast } from "../ui/swalUtils.js";

const Swal = typeof window !== "undefined" ? window.Swal : null;

// Ruta relativa al documento (panel.html)
const sonidoNotificacion = new Audio("./sound/notification.wav");
sonidoNotificacion.preload = "auto";

export function setupAudioUnlock() {
  document.addEventListener(
    "click",
    () => {
      sonidoNotificacion.play().catch(() => {});
    },
    { once: true },
  );
}

function notificarNuevaTransaccion(datos) {
  sonidoNotificacion.currentTime = 0;
  sonidoNotificacion
    .play()
    .catch(() =>
      console.log("Esperando interacción del usuario para activar sonido."),
    );

  showNewTransactionToast(datos);
}

export function subscribeRealtime(onRefresh) {
  if (!supabaseClient) return;
  supabaseClient
    .channel("cambios")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "transacciones",
      },
      (payload) => {
        notificarNuevaTransaccion(payload.new);
        if (typeof onRefresh === "function") onRefresh();
      },
    )
    .subscribe();
}
