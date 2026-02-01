/** Lógica de negocio: enviar transacción, buscar por WhatsApp */

import { appStore } from "../store/appStore.js";
import { create } from "../api/transaccionesApi.js";
import { getByWhatsApp } from "../api/transaccionesApi.js";
import { uploadComprobante } from "../api/storageApi.js";
import { MIN_MONTO_USD } from "../config/constants.js";

export async function submitTransaction(formData, proofFile) {
  if (!proofFile || !proofFile.size) {
    return { success: false, error: "Debes subir la foto de la transferencia." };
  }

  const montoUsd = parseFloat(formData.usd_amount);
  if (isNaN(montoUsd) || montoUsd < MIN_MONTO_USD) {
    return { success: false, error: "El envío mínimo permitido es de $50 USD." };
  }

  let publicUrl;
  try {
    publicUrl = await uploadComprobante(proofFile);
  } catch (e) {
    return { success: false, error: e.message };
  }

  const nuevaTransaccion = {
    usd_amount: montoUsd,
    exchange_rate: appStore.tasaCambio,
    sender_name: formData.sender_name,
    sender_whatsapp: formData.sender_whatsapp,
    recipient_name: formData.recipient_name,
    recipient_province: formData.recipient_province,
    recipient_municipality: formData.recipient_municipality,
    recipient_whatsapp: formData.recipient_whatsapp || null,
    transfer_proof_url: publicUrl,
    state: "pending",
  };

  const { error } = await create(nuevaTransaccion);
  if (error) {
    return { success: false, error: "Error al guardar datos: " + error.message };
  }
  return { success: true };
}

export async function searchTransactions(whatsapp) {
  const { data, error } = await getByWhatsApp(whatsapp, 5);
  if (error) throw error;
  return data ?? [];
}
