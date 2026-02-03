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

  // Limpiar nuevos campos de dirección
  const newFields = [
    "recipient-street",
    "recipient-street-between",
    "recipient-building",
    "recipient-house-number",
    "recipient-neighborhood",
    "recipient-latitude",
    "recipient-longitude",
  ];
  newFields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const display = document.getElementById("location-display");
  if (display) display.innerText = "";
}

/** Devuelve los datos del form para enviar (objeto plano). */
export function getFormData() {
  return {
    usd_amount: document.getElementById("usd-amount")?.value ?? "",
    sender_name: document.getElementById("sender-name")?.value ?? "",
    sender_whatsapp: document.getElementById("sender-whatsapp")?.value ?? "",
    recipient_name: document.getElementById("recipient-name")?.value ?? "",
    recipient_province:
      document.getElementById("recipient-province")?.value ?? "",
    recipient_municipality:
      document.getElementById("recipient-municipality")?.value ?? "",
    recipient_whatsapp:
      document.getElementById("recipient-whatsapp")?.value ?? "",
    recipient_street: document.getElementById("recipient-street")?.value ?? "",
    recipient_street_between:
      document.getElementById("recipient-street-between")?.value ?? "",
    recipient_building:
      document.getElementById("recipient-building")?.value ?? "",
    recipient_house_number:
      document.getElementById("recipient-house-number")?.value ?? "",
    recipient_neighborhood:
      document.getElementById("recipient-neighborhood")?.value ?? "",
    recipient_latitude:
      document.getElementById("recipient-latitude")?.value ?? "",
    recipient_longitude:
      document.getElementById("recipient-longitude")?.value ?? "",
  };
}
