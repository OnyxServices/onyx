/** Modal de transferencia: abrir, cerrar, nextStep. Depende de Swal y del form. */

import { resetForm } from "../components/transferForm.js";
import { resetCustomSelects } from "./customSelect.js";
import {
  validateNombreApellidos,
  validateWhatsAppCubaOrUS,
} from "../validators/formValidators.js";
import { showWarning, showSuccessToast } from "./swalUtils.js";

export function abrirModal() {
  const notification = document.getElementById("fab-notification");
  if (notification) notification.style.display = "none";

  const modal = document.getElementById("modalTransferencia");
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

export function cerrarModal() {
  const modal = document.getElementById("modalTransferencia");
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "auto";
  resetForm();
  resetCustomSelects();
}

export function nextStep(step) {
  const activeStepDiv = document.querySelector(".step.active");
  const currentStepNum = activeStepDiv
    ? parseInt(activeStepDiv.id.split("-")[1], 10)
    : 0;

  if (step > currentStepNum) {
    const inputs = activeStepDiv
      ? activeStepDiv.querySelectorAll("input[required], textarea[required]")
      : [];
    let hayCamposVacios = false;

    inputs.forEach((input) => {
      const isEmpty = !input.value.trim();
      if (isEmpty) hayCamposVacios = true;

      if (
        input.type === "hidden" &&
        (input.id === "recipient-province" ||
          input.id === "recipient-municipality")
      ) {
        const selectId =
          input.id === "recipient-province"
            ? "recipient-province-select"
            : "recipient-municipality-select";
        const selectEl = document.getElementById(selectId);
        if (selectEl) {
          selectEl.style.border = isEmpty ? "1px solid var(--error)" : "";
          selectEl.style.borderRadius = isEmpty ? "12px" : "";
        }
      } else {
        input.style.borderColor = isEmpty
          ? "var(--error)"
          : "var(--glass-border)";
      }
    });

    if (hayCamposVacios) {
      showWarning(
        "Falta información",
        "Por favor rellena todos los campos obligatorios para continuar.",
      );
      return;
    }

    if (currentStepNum === 1) {
      const montoEl = document.getElementById("usd-amount");
      const monto = montoEl ? parseFloat(montoEl.value) : NaN;
      if (isNaN(monto) || monto < 50) {
        showWarning(
          "Monto insuficiente",
          "El envío mínimo permitido es de $50 USD.",
        );
        if (montoEl) montoEl.style.borderColor = "var(--error)";
        return;
      }
      const senderName = document.getElementById("sender-name")?.value ?? "";
      const senderWhatsapp =
        document.getElementById("sender-whatsapp")?.value ?? "";
      const rName = validateNombreApellidos(senderName, "Nombre del remitente");
      if (!rName.valid) {
        showWarning("Datos incorrectos", rName.message);
        const el = document.getElementById("sender-name");
        if (el) el.style.borderColor = "var(--error)";
        return;
      }
      const rWa = validateWhatsAppCubaOrUS(senderWhatsapp);
      if (!rWa.valid) {
        showWarning("Datos incorrectos", rWa.message);
        const el = document.getElementById("sender-whatsapp");
        if (el) el.style.borderColor = "var(--error)";
        return;
      }
    }

    if (currentStepNum === 2) {
      const recipientName =
        document.getElementById("recipient-name")?.value ?? "";
      const recipientWhatsapp =
        document.getElementById("recipient-whatsapp")?.value ?? "";
      const rName = validateNombreApellidos(
        recipientName,
        "Nombre del destinatario",
      );
      if (!rName.valid) {
        showWarning("Datos incorrectos", rName.message);
        const el = document.getElementById("recipient-name");
        if (el) el.style.borderColor = "var(--error)";
        return;
      }
      const rWa = validateWhatsAppCubaOrUS(recipientWhatsapp);
      if (!rWa.valid) {
        showWarning("Datos incorrectos", rWa.message);
        const el = document.getElementById("recipient-whatsapp");
        if (el) el.style.borderColor = "var(--error)";
        return;
      }
    }
  }

  document
    .querySelectorAll(".step")
    .forEach((s) => s.classList.remove("active"));
  const nextDiv = document.getElementById(`step-${step}`);
  if (nextDiv) {
    nextDiv.classList.add("active");
    const modalContent = document.querySelector(".modal-content");
    if (modalContent) modalContent.scrollTop = 0;
  }
}

export function copiarZelle() {
  const texto = document.getElementById("zelle-account")?.innerText;
  if (texto) {
    navigator.clipboard.writeText(texto).then(() => {
      showSuccessToast("Copiado!");
    });
  }
}
