/**
 * Entry point del panel admin (panel.html).
 * type="module"; Supabase y SweetAlert2 cargados antes.
 */

import {
  abrirModal,
  cerrarModal,
  setupGlobalModalClose,
} from "./panel/modals.js";
import { cargarTasa, actualizarConfig } from "./panel/config.js";
import { cargarMetricas } from "./panel/metrics.js";
import {
  cargarConciliacion,
  guardarConciliacion,
} from "./panel/conciliacion.js";
import { cargarLogs } from "./panel/logs.js";
import {
  cargarTransacciones,
  cargarTransaccionesPaginadas,
  resetYPaginación,
  cambiarPagina,
  cambiarEstado,
  borrarTodasTransacciones,
  verRecibo,
  exportarCSV,
} from "./panel/transaccionesTable.js";
import { subscribeRealtime, setupAudioUnlock } from "./panel/realtime.js";
import { toggleDarkMode, applySavedTheme } from "./panel/theme.js";

let segundosParaRefresco = 15;

async function refreshAll() {
  await cargarTransacciones(refreshAll);
  await cargarMetricas();
}

function onOpenModal(id) {
  if (id === "modal-conciliacion") cargarConciliacion();
  if (id === "modal-logs") cargarLogs();
}

function abrirModalConCarga(id) {
  abrirModal(id, onOpenModal);
}

setupGlobalModalClose();

setInterval(() => {
  segundosParaRefresco--;
  if (segundosParaRefresco <= 0) {
    refreshAll();
    segundosParaRefresco = 15;
  }
  const timerEl = document.getElementById("update-timer");
  if (timerEl) timerEl.innerText = `Actualizando en: ${segundosParaRefresco}s`;
}, 1000);

document.addEventListener("DOMContentLoaded", () => {
  cargarTasa();
  refreshAll();
  subscribeRealtime(refreshAll);
  applySavedTheme();
  setupAudioUnlock();
});

// Exponer para onclick en HTML
window.abrirModal = abrirModalConCarga;
window.cerrarModal = (id) => cerrarModal(id);
window.actualizarConfig = () => actualizarConfig(refreshAll);
window.refreshAll = refreshAll;
window.resetYPaginación = () => {
  resetYPaginación();
  cargarTransacciones(refreshAll);
};
window.setSort = (column) => setSort(column);
window.cambiarPagina = (delta) => cambiarPagina(delta, refreshAll);
window.cambiarEstado = (id, estado) => cambiarEstado(id, estado, refreshAll);
window.borrarTodasTransacciones = () => borrarTodasTransacciones(refreshAll);
window.verRecibo = verRecibo;
window.exportarCSV = exportarCSV;
window.guardarConciliacion = guardarConciliacion;
window.toggleDarkMode = toggleDarkMode;
