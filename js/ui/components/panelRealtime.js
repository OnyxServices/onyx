/** Componente UI: Real-time del panel (suscripción a nuevas transacciones) */

import { showNewTransactionToast } from "../utils/swalUtils.js";
import { subscribeToInserts, unsubscribe } from "../../api/realtimeApi.js";

const Swal = typeof window !== "undefined" ? window.Swal : null;

// Ruta relativa al documento (panel.html)
const sonidoNotificacion = new Audio("../../data/sound/notification.wav");
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
  const channel = subscribeToInserts("transacciones", (newRow) => {
    notificarNuevaTransaccion(newRow);
    if (typeof onRefresh === "function") onRefresh();
  });
  return channel;
}

export function unsubscribeRealtime(channel) {
  unsubscribe(channel);
}
