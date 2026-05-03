/**
 * Lógica de negocio: enviar transacción, buscar por WhatsApp, listar y actualizar.
 * Modificado para notificar al bot de Telegram al recibir un nuevo envío.
 */

import { appStore } from "../store/appStore.js";
import {
  getAll  as txGetAll,
  getById as txGetById,
  create  as txCreate,
  update  as txUpdate,
  delete  as txDelete,
} from "../api/transactionApi.js";
import { uploadProof } from "../api/storageApi.js";
import { notificarTransaccionTelegram } from "./telegramService.js";

// ─────────────────────────────────────────────────────────────
// submitTransaction — punto principal: BD + Telegram
// ─────────────────────────────────────────────────────────────

export async function submitTransaction(formData, proofFile) {
  // 1. Validaciones previas
  if (!proofFile || !proofFile.size) {
    return {
      success: false,
      error: "Debes subir la foto de la transferencia.",
    };
  }

  const montoUsd = parseFloat(formData.usd_amount) || 0;
  if (montoUsd <= 0) {
    return { success: false, error: "Monto inválido" };
  }

  // 2. Subir comprobante al storage
  let publicUrl;
  try {
    publicUrl = await uploadProof(proofFile);
  } catch (e) {
    return { success: false, error: e.message || "Error subiendo comprobante" };
  }

  // 3. Construir objeto de transacción
  const nuevaTransaccion = {
    usd_amount:              montoUsd,
    exchange_rate:           appStore.tasaCambio,
    sender_name:             formData.sender_name,
    sender_whatsapp:         formData.sender_whatsapp,
    recipient_name:          formData.recipient_name,
    recipient_province:      formData.recipient_province,
    recipient_municipality:  formData.recipient_municipality,
    recipient_whatsapp:      formData.recipient_whatsapp      || null,
    recipient_street:        formData.recipient_street,
    recipient_street_between:formData.recipient_street_between|| null,
    recipient_building:      formData.recipient_building      || null,
    recipient_house_number:  formData.recipient_house_number,
    recipient_neighborhood:  formData.recipient_neighborhood,
    recipient_latitude:      formData.recipient_latitude
      ? parseFloat(formData.recipient_latitude)
      : null,
    recipient_longitude:     formData.recipient_longitude
      ? parseFloat(formData.recipient_longitude)
      : null,
    transfer_proof_url:      publicUrl,
    state:                   "pending",
  };

  // 4. Guardar en base de datos
  try {
    await txCreate(nuevaTransaccion);
  } catch (err) {
    return { success: false, error: "Error al guardar datos: " + err.message };
  }

  // 5. Notificar al bot de Telegram (no bloqueante: un fallo aquí no revierte el envío)
  try {
    await notificarTransaccionTelegram(formData, proofFile, appStore.tasaCambio);
  } catch (telegramError) {
    // El error se loguea pero no se devuelve al usuario;
    // la transacción ya quedó guardada en la BD.
    console.warn("⚠️ No se pudo notificar a Telegram:", telegramError.message);
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// Resto de funciones — sin cambios
// ─────────────────────────────────────────────────────────────

export async function searchTransactions(whatsapp, limit = 5) {
  const { data } = await txGetAll({
    search:   whatsapp,
    page:     0,
    pageSize: limit,
  });
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
  if (!id)                              throw new Error("ID inválido");
  if (!changes || typeof changes !== "object") throw new Error("Cambios inválidos");
  return await txUpdate(id, changes);
}

export async function deleteTransaction(id) {
  if (!id) throw new Error("ID inválido");
  return await txDelete(id);
}