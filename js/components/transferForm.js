/** Formulario de transferencia: reset, sincronizar con calculadora */

import { actualizarCalculosHome } from "../ui/calculator.js";

export function resetForm() {
  const form = document.getElementById("transaction-form");
  if (form) form.reset();

  document
    .querySelectorAll(".step")
    .forEach((s) => s.classList.remove("active"));
  const step0 = document.getElementById("step-0");
  if (step0) step0.classList.add("active");

  const homeInput = document.getElementById("home-usd-amount");
  if (homeInput) {
    const monto = parseFloat(homeInput.value) || 0;
    actualizarCalculosHome(monto);
  }

  const fileInput = document.getElementById("bank-transfer-proof");
  if (fileInput) fileInput.value = "";

  const provHidden = document.getElementById("recipient-province");
  const munHidden = document.getElementById("recipient-municipality");
  if (provHidden) provHidden.value = "";
  if (munHidden) munHidden.value = "";
}

/** Devuelve los datos del form para enviar (objeto plano). */
export function getFormData() {
  return {
    usd_amount: document.getElementById("usd-amount")?.value ?? "",
    sender_name: document.getElementById("sender-name")?.value ?? "",
    sender_whatsapp: document.getElementById("sender-whatsapp")?.value ?? "",
    recipient_name: document.getElementById("recipient-name")?.value ?? "",
    recipient_province: document.getElementById("recipient-province")?.value ?? "",
    recipient_municipality:
      document.getElementById("recipient-municipality")?.value ?? "",
    recipient_whatsapp:
      document.getElementById("recipient-whatsapp")?.value ?? "",
  };
}
