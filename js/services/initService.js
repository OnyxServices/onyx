/** Orquestación de la carga inicial de la app pública */

import { supabaseClient } from "../api/client.js";
import { loadConfig } from "./configService.js";
import { appStore } from "../store/appStore.js";
import * as loader from "../ui/loader.js";
import * as calculator from "../ui/calculator.js";

export async function iniciar() {
  const startTime = Date.now();
  const tipInterval = loader.rotarTips();

  const quitarLoader = () => {
    const wrapper = document.getElementById("loader-wrapper");
    if (!wrapper) return;
    wrapper.style.opacity = "0";
    wrapper.style.pointerEvents = "none";
    setTimeout(() => wrapper.remove(), 800);
  };

  try {
    loader.actualizarLoader(15, "Iniciando protocolos de seguridad...");

    if (!supabaseClient) {
      throw new Error(
        "supabaseClient no definido. Revisa la carga de la librería Supabase."
      );
    }

    await new Promise((r) => setTimeout(r, 600));
    loader.actualizarLoader(45, "Sincronizando con base de datos...");

    await loadConfig();

    loader.actualizarLoader(80, "Actualizando tasas");

    const homeInput = document.getElementById("home-usd-amount");
    if (homeInput) {
      const montoInicial = parseFloat(homeInput.value) || 0;
      calculator.actualizarCalculosHome(montoInicial);
    }

    loader.actualizarLoader(100, "Sistema listo para operar");
  } catch (error) {
    console.error("❌ Error al inicializar:", error);
    const statusText = document.getElementById("loader-status-text");
    if (statusText) {
      statusText.style.color = "var(--error)";
      statusText.innerText = "Error de conexión. Reintente.";
    }
  } finally {
    const elapsed = Date.now() - startTime;
    const delay = Math.max(4000, 6000 - elapsed);
    setTimeout(() => {
      if (tipInterval) clearInterval(tipInterval);
      quitarLoader();
    }, delay);
  }
}
