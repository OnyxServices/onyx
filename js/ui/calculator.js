/** Calculadora: monto USD -> CUP en home y en modal */

import { appStore } from "../store/appStore.js";

export function actualizarCalculosHome(monto) {
  const tasa = appStore.tasaCambio;
  const recibenCup = monto * tasa;
  const inputCup = document.getElementById("home-cup-amount");
  if (inputCup) inputCup.value = `${recibenCup.toLocaleString("es-CU")} CUP`;
}

export function actualizarCupEnModal(monto) {
  const tasa = appStore.tasaCambio;
  const totalCup = document.getElementById("cup-total");
  if (totalCup) {
    totalCup.innerText = `${(monto * tasa).toLocaleString("es-CU")} CUP`;
  }
}
