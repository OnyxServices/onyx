/**
 * COMPONENTE UI: Modal de rastreo
 *
 * SOLO funciones PASIVAS que:
 * - Reciben datos por parámetros
 * - Actualizan el DOM
 * - NO hacen llamadas a servicios
 * - NO tienen lógica de búsqueda
 *
 * La orquestación (búsqueda + servicios) va en trackingController.js
 */

import { showWarning } from "../utils/swalUtils.js";

export function abrirModalTracking() {
  const modal = document.getElementById("modalTracking");
  if (modal) {
    modal.classList.add("active");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

export function cerrarModalTracking() {
  const modal = document.getElementById("modalTracking");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.style.display = "none";
    }, 300);
  }
  document.body.style.overflow = "auto";
  const results = document.getElementById("tracking-results");
  if (results) results.style.display = "none";
  const search = document.getElementById("search-input");
  if (search) search.value = "";
}

/**
 * Función PASIVA: Renderiza resultados de búsqueda
 * @param {Array} data - Array de transacciones encontradas
 * @param {number} tasa - Tasa de cambio para cálculos
 */
export function renderTrackingResults(data, tasa) {
  const resultsContainer = document.getElementById("tracking-results");
  if (!resultsContainer) return;

  resultsContainer.innerHTML =
    '<h4 style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:15px;">ENVÍOS ENCONTRADOS:</h4>';

  data.forEach((tr) => {
    const fechaRaw = tr.creation_date;
    const fechaLabel = fechaRaw
      ? new Date(fechaRaw).toLocaleDateString()
      : "Envío Reciente";
    const state = (tr.state || "pending").toLowerCase();
    const cupRecibe = (
      tr.usd_amount * (tr.exchange_rate || tasa)
    ).toLocaleString();

    const card = `
      <div class="tracking-card">
        <div style="display:flex; justify-content:space-between; align-items:start;">
          <div>
            <small style="color:var(--text-secondary); font-size:0.7rem;">${fechaLabel}</small>
            <div style="font-weight:700; font-size:0.9rem;">${tr.recipient_name || "Sin nombre"}</div>
          </div>
          <span class="status-pill status-${state}">${state}</span>
        </div>
        <div class="tracking-info" style="margin-top:10px; display:flex; justify-content:space-between;">
          <span style="opacity:0.7">$${tr.usd_amount} USD</span>
          <strong style="color:var(--primary)">${cupRecibe} CUP</strong>
        </div>
      </div>
    `;
    resultsContainer.insertAdjacentHTML("beforeend", card);
  });
  resultsContainer.style.display = "block";
}

/**
 * Función PASIVA: Renderiza estado vacío o error
 * @param {string} errorMessage - Mensaje de error (opcional)
 */
export function renderTrackingEmpty(errorMessage = null) {
  const resultsContainer = document.getElementById("tracking-results");
  if (!resultsContainer) return;

  const message = errorMessage || "No se encontraron envíos para este número.";

  if (errorMessage && errorMessage.includes("database")) {
    resultsContainer.innerHTML = `<p style="color:var(--error); font-size:0.8rem; text-align:center;">Error al consultar la base de datos.</p>`;
  } else {
    resultsContainer.innerHTML = `
      <div style="text-align:center; padding: 20px; border: 1px dashed rgba(255,255,255,0.2); border-radius:15px;">
        <p style="color:var(--text-secondary); margin:0;">${message}</p>
      </div>
    `;
  }
  resultsContainer.style.display = "block";
}

/**
 * Función PASIVA: Muestra advertencia de búsqueda
 * @param {string} titulo - Título de la advertencia
 * @param {string} mensaje - Mensaje de advertencia
 */
export function showSearchWarning(titulo, mensaje) {
  showWarning(titulo, mensaje);
}

/**
 * Función PASIVA: Muestra estado de carga en búsqueda
 */
export function showSearchLoading() {
  const resultsContainer = document.getElementById("tracking-results");
  if (resultsContainer) {
    resultsContainer.innerHTML =
      '<p style="text-align:center; padding:20px;">Buscando...</p>';
    resultsContainer.style.display = "block";
  }
}
