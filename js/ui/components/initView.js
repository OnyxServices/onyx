/** Componente UI: Funciones de presentación para inicialización */

/**
 * Función PASIVA: Actualiza DOM con configuración
 */
export function updateConfigUI(config) {
  if (!config) return;

  const zelleAcc = document.getElementById("zelle-account");
  const zelleOwner = document.getElementById("zelle-owner");
  const zelleOwnerContainer = document.getElementById("zelle-owner-container");
  const homeTasaVal = document.getElementById("home-value-rate");

  if (zelleAcc) zelleAcc.textContent = config.cuentaZelle;
  if (zelleOwner) zelleOwner.textContent = config.propietarioZelle;
  if (zelleOwnerContainer) {
    zelleOwnerContainer.style.display = config.propietarioZelle
      ? "flex"
      : "none";
  }
  if (homeTasaVal) homeTasaVal.textContent = `${config.tasaCambio} CUP`;
}

/**
 * Función PASIVA: Muestra error de inicialización
 */
export function showInitializationError(error) {
  const statusText = document.getElementById("loader-status-text");
  if (statusText) {
    statusText.style.color = "var(--error)";
    statusText.innerText = "Error de conexión. Reintente.";
  }
}
