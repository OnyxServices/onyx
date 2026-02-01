/**
 * Entry point de la app pública (index.html).
 * Usa type="module"; Supabase y SweetAlert2 deben estar cargados antes.
 */

import { CUBA_REGIONS } from "../data/regions.js";
import { appStore } from "./store/appStore.js";
import { iniciar } from "./services/initService.js";
import { setupLocationSelectors } from "./components/locationSelectors.js";
import {
  actualizarCalculosHome,
  actualizarCupEnModal,
} from "./ui/calculator.js";
import {
  abrirModal,
  cerrarModal,
  nextStep,
  copiarZelle,
} from "./ui/modalTransfer.js";
import {
  abrirModalTracking,
  cerrarModalTracking,
  buscarTransaccion,
} from "./ui/modalTracking.js";
import { resetForm, getFormData } from "./components/transferForm.js";
import { resetCustomSelects } from "./ui/customSelect.js";
import { submitTransaction } from "./services/transactionService.js";
import { validateTransferForm } from "./validators/formValidators.js";

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

async function procesarEnvioFinal() {
  const btn = document.getElementById("btn-submit");
  const fileInput = document.getElementById("bank-transfer-proof");

  const formData = getFormData();
  const file = fileInput?.files?.[0] ?? null;
  const validation = validateTransferForm(formData, file);
  if (!validation.valid) {
    if (Swal) {
      Swal.fire({
        icon: "error",
        title: "Datos incorrectos",
        text: validation.message,
        background: "#1e2332",
        color: "#fff",
        confirmButtonColor: "var(--primary)",
      });
    }
    return;
  }

  btn.disabled = true;
  const originalBtnText = btn.innerText;
  btn.innerText = "Subiendo datos...";

  try {
    const result = await submitTransaction(formData, file);

    if (result.success) {
      if (Swal) {
        await Swal.fire({
          icon: "success",
          title: "¡Envío Exitoso!",
          text: "Tu transferencia está en revisión. Te avisaremos por WhatsApp.",
          background: "#1e2332",
          color: "#fff",
          confirmButtonColor: "var(--primary)",
        });
      }
      cerrarModal();
      resetCustomSelects();
      document
        .querySelectorAll("#transaction-form input, #transaction-form textarea")
        .forEach((input) => (input.value = ""));
      const homeInput = document.getElementById("home-usd-amount");
      if (homeInput) {
        homeInput.value = "";
        actualizarCalculosHome(0);
      }
    } else {
      if (Swal) {
        Swal.fire({
          icon: "error",
          title: "Hubo un problema",
          text: result.error,
          background: "#1e2332",
          color: "#fff",
          confirmButtonColor: "var(--primary)",
        });
      }
    }
  } catch (error) {
    console.error("Error crítico:", error);
    if (Swal) {
      Swal.fire({
        icon: "error",
        title: "Hubo un problema",
        text: error.message,
        background: "#1e2332",
        color: "#fff",
        confirmButtonColor: "var(--primary)",
      });
    }
  } finally {
    btn.disabled = false;
    btn.innerText = originalBtnText || "Finalizar Envío";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  iniciar();
  setupListeners();
  setupLocationSelectors();
});

/**
 * LÓGICA DE HORARIO DE ATENCIÓN
 */


// Ejecutar al cargar la página
actualizarEstadoHorario();

// Opcional: Revisar cada minuto para cambiar el estado automáticamente 
// sin que el usuario refresque la página
setInterval(actualizarEstadoHorario, 60000);

// Exponer para onclick en HTML (compatibilidad)
window.procesarEnvioFinal = procesarEnvioFinal;
window.copiarZelle = copiarZelle;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.nextStep = nextStep;
window.abrirModalTracking = abrirModalTracking;
window.cerrarModalTracking = cerrarModalTracking;
window.buscarTransaccion = buscarTransaccion;
