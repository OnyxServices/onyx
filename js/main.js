/**
 * Entry point de la app pública (index.html).
 * Usa type="module"; Supabase y SweetAlert2 deben estar cargados antes.
 */

import { CUBA_REGIONS } from "../data/regions.js";
import { appStore } from "./store/appStore.js";
import { orchestrateInitialization } from "./controllers/initController.js";
import { setupLocationSelectors } from "./ui/components/locationSelectors.js";
import {
  actualizarCalculosHome,
  actualizarCupEnModal,
} from "./ui/utils/calculator.js";
import {
  abrirModal,
  cerrarModal,
  nextStep,
  copiarZelle,
  copiarPropietario,
} from "./ui/components/modalTransfer.js";
import {
  abrirModalTracking,
  cerrarModalTracking,
} from "./ui/components/modalTracking.js";
import { orchestrateSearchTransactions } from "./controllers/trackingController.js";
import { resetForm, getFormData } from "./ui/components/transferForm.js";
import { resetCustomSelects } from "./ui/utils/customSelect.js";
import { orchestrateSubmitTransaction } from "./controllers/submitTransactionController.js";
import { validateTransferForm } from "./validators/formValidators.js";
import { showError, showSuccess } from "./ui/utils/swalUtils.js";
import { initializeStatusIndicator } from "./ui/components/statusIndicator.js";
import {
  orchestrateOpenMap,
  orchestrateCloseMap,
  orchestrateConfirmLocation,
} from "./controllers/locationController.js";

const Swal = typeof window !== "undefined" ? window.Swal : null;

// Poblar regiones en el store
appStore.regionesCuba = CUBA_REGIONS;

function setupListeners() {
  const homeInput = document.getElementById("home-usd-amount");
  if (homeInput) {
    homeInput.addEventListener("input", (e) => {
      const monto = parseFloat(e.target.value) || 0;
      actualizarCalculosHome(monto);
    });
  }

  const modalInput = document.getElementById("usd-amount");
  if (modalInput) {
    modalInput.addEventListener("input", (e) => {
      const monto = parseFloat(e.target.value) || 0;
      actualizarCupEnModal(monto);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  orchestrateInitialization();
  setupListeners();
  setupLocationSelectors();
  initializeStatusIndicator();
});

// Exponer para onclick en HTML (compatibilidad)
window.procesarEnvioFinal = orchestrateSubmitTransaction;
window.copiarZelle = copiarZelle;
window.copiarPropietario = copiarPropietario;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.nextStep = nextStep;
window.abrirModalTracking = abrirModalTracking;
window.cerrarModalTracking = cerrarModalTracking;
window.buscarTransaccion = orchestrateSearchTransactions;
window.abrirModalMapa = orchestrateOpenMap;
window.cerrarModalMapa = orchestrateCloseMap;
window.confirmarUbicacion = orchestrateConfirmLocation;
