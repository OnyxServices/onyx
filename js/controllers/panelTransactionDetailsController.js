/**
 * ORQUESTRADOR: Coordina la lógica de detalles de transacción
 *
 * Responsabilidades:
 * - Mantener estado local (currentTransaction, detailsMap)
 * - Llamar a servicios
 * - Manejar errores de red
 * - Llamar a funciones UI pasivas
 */

import { getTransactionById } from "../services/transactionService.js";
import {
  generarPDFTransaccion,
  generarWhatsAppURL,
} from "../services/panelTransactionDetailsService.js";
import {
  mostrarDetallesTransaccion,
  ocultarDetallesTransaccion,
  mostrarErrorDetalles,
  mostrarExitoDetalles,
} from "../ui/components/panel/panelTransactionDetails.js";

// ESTADO LOCAL: vive aquí, no en el componente UI
let currentTransaction = null;

/**
 * Orquesta el flujo: obtener datos -> actualizar UI
 * @param {string} transactionId - ID de la transacción
 */
export async function orchestrateOpenDetails(transactionId) {
  try {
    // 1. Llamar al servicio (puro)
    const data = await getTransactionById(transactionId);

    // 2. Guardar estado local en el orquestador
    currentTransaction = data;

    // 3. Llamar a función UI pasiva con los datos
    mostrarDetallesTransaccion(data);
  } catch (error) {
    console.error("❌ Error al cargar detalles:", error);
    mostrarErrorDetalles("Error al cargar datos", error.message);
  }
}

/**
 * Orquesta el cierre del modal
 */
export function orchestrateCloseDetails() {
  currentTransaction = null;
  ocultarDetallesTransaccion();
}

/**
 * Orquesta la generación de PDF
 */
export async function orchestrateGeneratePDF() {
  if (!currentTransaction) {
    mostrarErrorDetalles("Error", "No hay datos de transacción cargados");
    return;
  }

  try {
    // 1. Llamar al servicio
    await generarPDFTransaccion(currentTransaction);

    // 2. Mostrar éxito en UI
    mostrarExitoDetalles("Éxito", "PDF generado correctamente");
  } catch (error) {
    console.error("❌ Error al generar PDF:", error);
    mostrarErrorDetalles("Error al generar PDF", error.message);
  }
}

/**
 * Orquesta el envío de WhatsApp al remitente
 */
export async function orchestrateSendWA_Sender() {
  if (!currentTransaction) {
    mostrarErrorDetalles("Error", "No hay datos de transacción cargados");
    return;
  }

  try {
    // 1. Obtener URL del servicio
    const waUrl = await generarWhatsAppURL(currentTransaction, "remitente");

    // 2. Abrir navegador (Controller es responsable de interacción con browser)
    window.open(waUrl, "_blank");

    // 3. Mostrar éxito en UI
    mostrarExitoDetalles("Éxito", "Abriendo WhatsApp del remitente");
  } catch (error) {
    console.error("❌ Error al enviar WhatsApp:", error);
    mostrarErrorDetalles("Error al enviar", error.message);
  }
}

/**
 * Orquesta el envío de WhatsApp al destinatario
 */
export async function orchestrateSendWA_Recipient() {
  if (!currentTransaction) {
    mostrarErrorDetalles("Error", "No hay datos de transacción cargados");
    return;
  }

  try {
    // 1. Obtener URL del servicio
    const waUrl = await generarWhatsAppURL(currentTransaction, "destinatario");

    // 2. Abrir navegador (Controller es responsable de interacción con browser)
    window.open(waUrl, "_blank");

    // 3. Mostrar éxito en UI
    mostrarExitoDetalles("Éxito", "Abriendo WhatsApp del destinatario");
  } catch (error) {
    console.error("❌ Error al enviar WhatsApp:", error);
    mostrarErrorDetalles("Error al enviar", error.message);
  }
}

/**
 * Getter para obtener transacción actual (si es necesario)
 */
export function getCurrentTransaction() {
  return currentTransaction;
}
