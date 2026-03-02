/** Lógica de negocio: enviar transacción, buscar por WhatsApp, listar y actualizar */

import { appStore } from "../store/appStore.js";
import {
  getAll as txGetAll,
  getById as txGetById,
  create as txCreate,
  update as txUpdate,
  delete as txDelete,
} from "../api/transactionApi.js";
import { uploadProof } from "../api/storageApi.js";

export async function submitTransaction(formData, proofFile) {
  if (!proofFile || !proofFile.size) {
    return { success: false, error: "Debes subir la foto de la transferencia." };
  }

  const montoUsd = parseFloat(formData.usd_amount) || 0;
  if (montoUsd <= 0) {
    return { success: false, error: "Monto inválido" };
  }

  let publicUrl;
  try {
    publicUrl = await uploadProof(proofFile);
  } catch (e) {
    return { success: false, error: e.message || "Error subiendo comprobante" };
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
    recipient_street: formData.recipient_street,
    recipient_street_between: formData.recipient_street_between || null,
    recipient_building: formData.recipient_building || null,
    recipient_house_number: formData.recipient_house_number,
    recipient_neighborhood: formData.recipient_neighborhood,
    recipient_latitude: formData.recipient_latitude
      ? parseFloat(formData.recipient_latitude)
      : null,
    recipient_longitude: formData.recipient_longitude
      ? parseFloat(formData.recipient_longitude)
      : null,
    transfer_proof_url: publicUrl,
    state: "pending",
  };

  try {
    await txCreate(nuevaTransaccion);
    return { success: true };
  } catch (err) {
    return { success: false, error: "Error al guardar datos: " + err.message };
  }
}

export async function searchTransactions(whatsapp, limit = 5) {
  // Lógica: buscar por número en remitente o destinatario
  const { data } = await txGetAll({ search: whatsapp, page: 0, pageSize: limit });
  return data ?? [];
}

export async function listTransactions(filters = {}) {
  try {
    return await txGetAll(filters);
  } catch (err) {
    return { data: [], count: 0, error: err };
  }
}

export async function getTransactionById(id) {
  if (!id) throw new Error("ID inválido");
  return await txGetById(id);
}

export async function updateTransaction(id, changes) {
  if (!id) throw new Error("ID inválido");
  if (!changes || typeof changes !== "object") throw new Error("Cambios inválidos");
  return await txUpdate(id, changes);
}

export async function deleteTransaction(id) {
  if (!id) throw new Error("ID inválido");
  return await txDelete(id);
}
