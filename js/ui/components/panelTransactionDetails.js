/** Componente UI: Detalles de transacción del panel */

import { getTransactionById } from "../../services/transactionService.js";
import { getPanelToast } from "../utils/panelToast.js";
import {
  generarPDFTransaccion,
  enviarWhatsAppTransaccion,
} from "../../services/panelTransactionDetailsService.js";

const Swal = typeof window !== "undefined" ? window.Swal : null;

let currentTransaction = null;
let detailsMap = null;

export async function abrirDetallesTransaccion(transactionId) {
  try {
    const data = await getTransactionById(transactionId);
    currentTransaction = data;
    cargarDetallesEnModal(data);
    const modal = document.getElementById("modal-details");
    if (modal) modal.style.display = "flex";
  } catch (err) {
    const Toast = getPanelToast();
    if (Toast) Toast.fire({ icon: "error", title: "Error al cargar datos" });
  }
}

function cargarDetallesEnModal(tx) {
  // Información del remitente
  document.getElementById("det-sender").innerText = tx.sender_name || "-";
  document.getElementById("det-sender-wa").innerText =
    tx.sender_whatsapp || "-";

  // Información del destinatario
  document.getElementById("det-recipient").innerText = tx.recipient_name || "-";
  document.getElementById("det-recipient-wa").innerText =
    tx.recipient_whatsapp || "-";

  // Dirección completa
  const addressParts = [];
  if (tx.recipient_street) addressParts.push(`Calle: ${tx.recipient_street}`);
  if (tx.recipient_street_between)
    addressParts.push(`Entre calles: ${tx.recipient_street_between}`);
  if (tx.recipient_building)
    addressParts.push(`Edificio: ${tx.recipient_building}`);
  if (tx.recipient_house_number)
    addressParts.push(`Número: ${tx.recipient_house_number}`);
  if (tx.recipient_neighborhood)
    addressParts.push(`Reparto: ${tx.recipient_neighborhood}`);
  if (tx.recipient_province)
    addressParts.push(`Provincia: ${tx.recipient_province}`);
  if (tx.recipient_municipality)
    addressParts.push(`Municipio: ${tx.recipient_municipality}`);

  const addressEl = document.getElementById("det-address");
  addressEl.innerHTML =
    addressParts.length > 0
      ? addressParts.map((p) => `<p style="margin: 5px 0;">${p}</p>`).join("")
      : "<p>No hay información de dirección disponible</p>";

  // Inicializar mapa si hay coordenadas
  const mapContainer = document.getElementById("det-map-container");
  if (tx.recipient_latitude && tx.recipient_longitude) {
    mapContainer.style.display = "block";
    inicializarMapaDetalles(tx.recipient_latitude, tx.recipient_longitude);
  } else {
    mapContainer.style.display = "none";
  }
}

function inicializarMapaDetalles(lat, lng) {
  if (detailsMap) {
    detailsMap.remove();
  }

  detailsMap = L.map("det-map").setView([lat, lng], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(detailsMap);

  L.marker([lat, lng])
    .addTo(detailsMap)
    .bindPopup(`<b>${currentTransaction.recipient_name}</b>`);
}

export async function generarPDF() {
  if (!currentTransaction) return;

  try {
    await generarPDFTransaccion(currentTransaction);
    const Toast = getPanelToast();
    if (Toast)
      Toast.fire({ icon: "success", title: "PDF generado correctamente" });
  } catch (err) {
    const Toast = getPanelToast();
    if (Toast) Toast.fire({ icon: "error", title: "Error al generar PDF" });
  }
}

export async function enviarWA_Remitente() {
  if (!currentTransaction) return;

  try {
    await enviarWhatsAppTransaccion(currentTransaction, "remitente");
    const Toast = getPanelToast();
    if (Toast)
      Toast.fire({ icon: "success", title: "Mensaje enviado al remitente" });
  } catch (err) {
    const Toast = getPanelToast();
    if (Toast)
      Toast.fire({ icon: "error", title: err.message || "Error al enviar" });
  }
}

export async function enviarWA_Destinatario() {
  if (!currentTransaction) return;

  try {
    await enviarWhatsAppTransaccion(currentTransaction, "destinatario");
    const Toast = getPanelToast();
    if (Toast)
      Toast.fire({ icon: "success", title: "Mensaje enviado al destinatario" });
  } catch (err) {
    const Toast = getPanelToast();
    if (Toast)
      Toast.fire({ icon: "error", title: err.message || "Error al enviar" });
  }
}
