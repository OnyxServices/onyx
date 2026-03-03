/**
 * Entry point del panel admin (panel.html).
 * type="module"; Supabase y SweetAlert2 cargados antes.
 */

import {
  abrirModal,
  cerrarModal,
  setupGlobalModalClose,
} from "./ui/components/panelModals.js";
import { cargarTasa, actualizarConfig } from "./ui/components/panelConfig.js";
import { cargarMetricas } from "./ui/components/panelMetrics.js";
import { cargarGraficos } from "./ui/components/panelCharts.js";
import {
  cargarTransacciones,
  resetYPaginación,
  cambiarPagina,
  cambiarEstado,
  verRecibo,
  exportarCSV,
  setSort,
} from "./ui/components/panelTransaccionesTable.js";
import {
  subscribeRealtime,
  setupAudioUnlock,
} from "./ui/components/panelRealtime.js";
import {
  abrirDetallesTransaccion,
  generarPDF,
  enviarWA_Remitente,
  enviarWA_Destinatario,
} from "./ui/components/panelTransactionDetails.js";
import { initializeStatusIndicator } from "./ui/components/statusIndicator.js";

let segundosParaRefresco = 15;

async function refreshAll() {
  await cargarTransacciones(refreshAll);
  await cargarMetricas();
}

function onOpenModal(id) {
  if (id === "modal-metricas") cargarGraficos();
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

  setupAudioUnlock();
  initializeStatusIndicator();
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
window.verRecibo = verRecibo;
window.exportarCSV = exportarCSV;
window.abrirDetallesTransaccion = abrirDetallesTransaccion;
window.generarPDF = generarPDF;
window.enviarWA_Remitente = enviarWA_Remitente;
window.enviarWA_Destinatario = enviarWA_Destinatario;
