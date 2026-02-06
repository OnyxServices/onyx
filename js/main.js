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
  copiarPropietario,
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
import { showError, showSuccess } from "./ui/swalUtils.js";
import { initializeStatusIndicator } from "./ui/statusIndicator.js";

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
    showError("Datos incorrectos", validation.message);
    return;
  }

  btn.disabled = true;
  const originalBtnText = btn.innerText;
  btn.innerText = "Subiendo datos...";

  try {
    const result = await submitTransaction(formData, file);

    if (result.success) {
      showSuccess(
        "¡Envío Exitoso!",
        "Tu transferencia está en revisión. Te avisaremos por WhatsApp.",
      );
      cerrarModal();
      document
        .querySelectorAll("#transaction-form input, #transaction-form textarea")
        .forEach((input) => (input.value = ""));
      const homeInput = document.getElementById("home-usd-amount");
      if (homeInput) {
        homeInput.value = "";
        actualizarCalculosHome(0);
      }
    } else {
      showError("Hubo un problema", result.error);
    }
  } catch (error) {
    console.error("Error crítico:", error);
    showError("Hubo un problema", error.message);
  } finally {
    btn.disabled = false;
    btn.innerText = originalBtnText || "Finalizar Envío";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  iniciar();
  setupListeners();
  setupLocationSelectors();
  initializeStatusIndicator();
});

// Exponer para onclick en HTML (compatibilidad)
window.procesarEnvioFinal = procesarEnvioFinal;
window.copiarZelle = copiarZelle;
window.copiarPropietario = copiarPropietario;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.nextStep = nextStep;
window.abrirModalTracking = abrirModalTracking;
window.cerrarModalTracking = cerrarModalTracking;
window.buscarTransaccion = buscarTransaccion;
window.abrirModalMapa = abrirModalMapa;
window.cerrarModalMapa = cerrarModalMapa;
window.confirmarUbicacion = confirmarUbicacion;

// Variables para el mapa
let map;
let marker;

function abrirModalMapa() {
  const modal = document.getElementById("modalMapa");
  if (modal) {
    modal.style.display = "flex";
    inicializarMapa();
  }
}

function cerrarModalMapa() {
  const modal = document.getElementById("modalMapa");
  if (modal) {
    modal.style.display = "none";
    if (map) {
      map.remove();
      map = null;
      marker = null;
    }
  }
}

function inicializarMapa() {
  // Coordenadas iniciales de Cuba
  const cubaLat = 21.521757;
  const cubaLng = -77.781167;
  const zoom = 6;

  map = L.map("map").setView([cubaLat, cubaLng], zoom);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Agregar marcador inicial si ya hay coordenadas
  const latInput = document.getElementById("recipient-latitude");
  const lngInput = document.getElementById("recipient-longitude");
  if (latInput.value && lngInput.value) {
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    marker = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], 15);
  }

  // Evento para colocar marcador al hacer clic
  map.on("click", function (e) {
    if (marker) {
      map.removeLayer(marker);
    }
    marker = L.marker(e.latlng).addTo(map);
  });
}

function confirmarUbicacion() {
  if (!marker) {
    showError(
      "Selecciona una ubicación",
      "Haz clic en el mapa para seleccionar la ubicación del destinatario.",
    );
    return;
  }

  const latlng = marker.getLatLng();
  document.getElementById("recipient-latitude").value = latlng.lat;
  document.getElementById("recipient-longitude").value = latlng.lng;

  const display = document.getElementById("location-display");
  display.innerText = `Ubicación seleccionada: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;

  cerrarModalMapa();
}

// Agregar listener para el botón de seleccionar ubicación
document.addEventListener("DOMContentLoaded", () => {
  const selectLocationBtn = document.getElementById("select-location-btn");
  if (selectLocationBtn) {
    selectLocationBtn.addEventListener("click", abrirModalMapa);
  }

  const confirmBtn = document.getElementById("confirm-location-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", confirmarUbicacion);
  }
});
