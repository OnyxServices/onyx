/**
 * ORQUESTADOR: Coordina la inicialización (servicios + UI)
 * Responsabilidades:
 * - Llamar al servicio iniciar()
 * - Actualizar UI (loader, estado)
 * - Manejar errores de red
 */

import { iniciar as initService } from "../services/initService.js";
import * as loaderUI from "../ui/utils/loader.js";
import * as calculatorUI from "../ui/utils/calculator.js";
import {
  updateConfigUI,
  showInitializationError,
} from "../ui/components/initView.js";
/**
 * Orquesta todo el flujo de inicialización
 * @returns {Promise<{success: boolean, config?: object}>}
 */
export async function orchestrateInitialization() {
  const startTime = Date.now();
  const tipInterval = loaderUI.rotarTips();

  const hideLoader = () => {
    const wrapper = document.getElementById("loader-wrapper");
    if (!wrapper) return;
    wrapper.style.opacity = "0";
    wrapper.style.pointerEvents = "none";
    setTimeout(() => wrapper.remove(), 800);
  };

  try {
    loaderUI.actualizarLoader(15, "Iniciando protocolos de seguridad...");

    // Llamar al servicio (puro)
    const result = await initService();
    loaderUI.actualizarLoader(80, "Actualizando tasas");

    // Actualizar UI con los datos
    updateConfigUI(result.config);

    // Actualizar calculadora con monto inicial
    const homeInput = document.getElementById("home-usd-amount");
    if (homeInput) {
      const montoInicial = parseFloat(homeInput.value) || 0;
      calculatorUI.actualizarCalculosHome(montoInicial);
    }

    loaderUI.actualizarLoader(100, "Sistema listo para operar");
    return { success: true, config: result.config };
  } catch (error) {
    console.error("❌ Error al inicializar:", error);
    showInitializationError(error);
    return { success: false, error: error.message };
  } finally {
    const elapsed = Date.now() - startTime;
    const delay = Math.max(4000, 6000 - elapsed);
    setTimeout(() => {
      if (tipInterval) clearInterval(tipInterval);
      hideLoader();
    }, delay);
  }
}
