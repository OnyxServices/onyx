/**
 * ORQUESTRADOR: Coordina el envío final de transacciones
 *
 * Responsabilidades:
 * - Obtener datos del formulario
 * - Validar datos
 * - Llamar a servicio de envío
 * - Actualizar UI según resultado
 * - Limpiar formulario
 */

import { submitTransaction } from "../services/transactionService.js";
import { getFormData } from "../ui/components/transferForm.js";
import { cerrarModal } from "../ui/components/modalTransfer.js";
import { validateTransferForm } from "../validators/formValidators.js";
import { showError, showSuccess } from "../ui/utils/swalUtils.js";
import { actualizarCalculosHome } from "../ui/utils/calculator.js";

/**
 * Orquesta el proceso completo de envío de transacción
 */
export async function orchestrateSubmitTransaction() {
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

      // Limpiar formulario
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
