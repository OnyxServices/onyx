/**
 * Controlador de la UI para la Página de Inicio (Public)
 * Se encarga de actualizar el DOM con la información de configuración.
 */
import { appStore } from "../store/appStore.js";
import * as calculator from "../ui/calculator.js";

export function updateHomeUI(config) {
  // Actualizar Tasa
  const homeTasaVal = document.getElementById("home-value-rate");
  if (homeTasaVal) {
    homeTasaVal.textContent = `${appStore.tasaCambio} CUP`;
  }

  // Actualizar Datos de Zelle (si se muestran en home)
  const zelleAcc = document.getElementById("zelle-account");
  const zelleOwner = document.getElementById("zelle-owner");
  const zelleOwnerContainer = document.getElementById("zelle-owner-container");

  if (zelleAcc) zelleAcc.textContent = appStore.cuentaZelle;
  if (zelleOwner) zelleOwner.textContent = appStore.propietarioZelle;
  
  if (zelleOwnerContainer) {
    zelleOwnerContainer.style.display = appStore.propietarioZelle
      ? "flex"
      : "none";
  }

  // Actualizar Calculadora si hay monto inicial
  const homeInput = document.getElementById("home-usd-amount");
  if (homeInput) {
    const montoInicial = parseFloat(homeInput.value) || 0;
    calculator.actualizarCalculosHome(montoInicial);
  }
}
