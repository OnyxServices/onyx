/** Real-time: suscripción a nuevas transacciones, sonido y notificación */

import { supabaseClient } from "../api/client.js";

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
    { once: true }
  );
}

function notificarNuevaTransaccion(datos) {
  sonidoNotificacion.currentTime = 0;
  sonidoNotificacion.play().catch(() =>
    console.log("Esperando interacción del usuario para activar sonido.")
  );

  if (Swal) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      iconColor: "#25D366",
      title: "¡NUEVA TRANSACCIÓN!",
      html: `
        <div style="text-align: left; font-size: 0.9rem;">
          Enviado por: <b>${datos.sender_name || ""}</b><br>
          Monto: <span style="color: #166534; font-weight: bold;">$${datos.usd_amount || 0} USD</span>
        </div>
      `,
      showConfirmButton: false,
      timer: 10000,
      timerProgressBar: true,
      background: document.body.classList.contains("dark")
        ? "#1e293b"
        : "#ffffff",
      color: document.body.classList.contains("dark") ? "#f1f5f9" : "#1e293b",
      didOpen: (toast) => {
        toast.parentElement.style.zIndex = "10000";
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });
  }
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
      }
    )
    .subscribe();
}
