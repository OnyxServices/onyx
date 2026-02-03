/** Modal de rastreo: abrir, cerrar, renderizar resultados */

import { appStore } from "../store/appStore.js";
import { searchTransactions } from "../services/transactionService.js";
import { showWarning } from "./swalUtils.js";

const Swal = typeof window !== "undefined" ? window.Swal : null;

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

export async function buscarTransaccion() {
  const busqueda = document.getElementById("search-input")?.value?.trim() ?? "";
  const resultsContainer = document.getElementById("tracking-results");
  if (!resultsContainer) return;

  if (!busqueda) {
    showWarning("Atención", "Ingresa tu número de WhatsApp.");
    return;
  }

  resultsContainer.innerHTML =
    '<p style="text-align:center; padding:20px;">Buscando...</p>';
  resultsContainer.style.display = "block";

  try {
    const data = await searchTransactions(busqueda);

    if (!data || data.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align:center; padding: 20px; border: 1px dashed rgba(255,255,255,0.2); border-radius:15px;">
          <p style="color:var(--text-secondary); margin:0;">No se encontraron envíos para este número.</p>
        </div>`;
      return;
    }

    const tasa = appStore.tasaCambio;
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
        </div>`;
      resultsContainer.innerHTML += card;
    });
  } catch (err) {
    console.error("Error detallado:", err);
    resultsContainer.innerHTML = `<p style="color:var(--error); font-size:0.8rem; text-align:center;">Error al consultar la base de datos.</p>`;
  }
}
