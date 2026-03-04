/**
 * COMPONENTE UI: Detalles de transacción del panel
 *
 * Este archivo SOLO contiene funciones PASIVAS que:
 * - Reciben datos por parámetros
 * - Actualizan el DOM
 * - NO hacen llamadas a servicios
 * - NO manejan errores de red
 *
 * La orquestación (servicios + estado) va en panelMain.js
 */

import { getPanelToast } from "../../utils/panelToast.js";

let detailsMap = null;

/**
 * Función PASIVA: Renderiza detalles en el modal
 * @param {Object} tx - Transacción con todos los datos
 */
export function mostrarDetallesTransaccion(tx) {
  if (!tx) return;

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
    renderMapaDetalles(
      tx.recipient_latitude,
      tx.recipient_longitude,
      tx.recipient_name,
    );
  } else {
    mapContainer.style.display = "none";
  }

  // Mostrar modal
  const modal = document.getElementById("modal-details");
  if (modal) modal.style.display = "flex";
}

/**
 * Función PASIVA: Renderiza el mapa con coordenadas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {string} recipientName - Nombre del destinatario
 */
function renderMapaDetalles(lat, lng, recipientName) {
  if (detailsMap) {
    detailsMap.remove();
  }

  detailsMap = L.map("det-map").setView([lat, lng], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(detailsMap);

  L.marker([lat, lng]).addTo(detailsMap).bindPopup(`<b>${recipientName}</b>`);
}

/**
 * Función PASIVA: Oculta el modal
 */
export function ocultarDetallesTransaccion() {
  const modal = document.getElementById("modal-details");
  if (modal) modal.style.display = "none";
}

/**
 * Función PASIVA: Muestra error genérico en modal
 * @param {string} titulo - Título del error
 * @param {string} mensaje - Mensaje del error
 */
export function mostrarErrorDetalles(titulo, mensaje) {
  const Toast = getPanelToast();
  if (Toast) Toast.fire({ icon: "error", title: titulo, text: mensaje });
}

/**
 * Función PASIVA: Muestra éxito genérico
 * @param {string} titulo - Título del mensaje
 * @param {string} mensaje - Mensaje de éxito
 */
export function mostrarExitoDetalles(titulo, mensaje) {
  const Toast = getPanelToast();
  if (Toast) Toast.fire({ icon: "success", title: titulo, text: mensaje });
}
