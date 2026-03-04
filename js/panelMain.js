/**
 * Entry point del panel admin (panel.html).
 * type="module"; Supabase y SweetAlert2 cargados antes.
 */

import {
  abrirModal,
  cerrarModal,
  setupGlobalModalClose,
} from "./ui/components/panel/panelModals.js";
import {
  orchestrateLoadConfig,
  orchestrateUpdateConfig,
} from "./controllers/panelConfigController.js";
import { orchestrateLoadMetrics } from "./controllers/panelMetricsController.js";
import { orchestrateLoadCharts } from "./controllers/panelChartsController.js";
import {
  cargarTransacciones,
  resetYPaginación,
  cambiarPagina,
  cambiarEstado,
  verRecibo,
  exportarCSV,
  setSort,
} from "./controllers/panelTransaccionesController.js";
import {
  subscribeRealtime,
  setupAudioUnlock,
} from "./ui/components/panel/panelRealtime.js";
import {
  orchestrateOpenDetails,
  orchestrateCloseDetails,
  orchestrateGeneratePDF,
  orchestrateSendWA_Sender,
  orchestrateSendWA_Recipient,
} from "./controllers/panelTransactionDetailsController.js";
import { initializeStatusIndicator } from "./ui/components/statusIndicator.js";

let segundosParaRefresco = 15;

async function refreshAll() {
  await cargarTransacciones(refreshAll);
  await orchestrateLoadMetrics();
}

function onOpenModal(id) {
  if (id === "modal-metricas") orchestrateLoadCharts();
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
  orchestrateLoadConfig();
  refreshAll();
  subscribeRealtime(refreshAll);

  setupAudioUnlock();
  initializeStatusIndicator();
});

// Exponer para onclick en HTML
window.abrirModal = abrirModalConCarga;
window.cerrarModal = (id) => cerrarModal(id);
window.actualizarConfig = () => orchestrateUpdateConfig(refreshAll);
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
window.abrirDetallesTransaccion = orchestrateOpenDetails;
window.cerrarDetallesTransaccion = orchestrateCloseDetails;
window.generarPDF = orchestrateGeneratePDF;
window.enviarWA_Remitente = orchestrateSendWA_Sender;
window.enviarWA_Destinatario = orchestrateSendWA_Recipient;
