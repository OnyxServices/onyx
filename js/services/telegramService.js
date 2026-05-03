/**
 * Servicio de notificaciones: envía datos de transacción al bot de Telegram.
 * Usa la API de Telegram (sendPhoto) para enviar la imagen del comprobante
 * junto con un caption formateado con todos los datos del formulario.
 *
 * ⚙️  CONFIGURACIÓN — reemplaza estos dos valores antes de usar:
 */
const TELEGRAM_BOT_TOKEN = "8608347138:AAEKQu_alalb28XFZt1vU-WCcXOii-eSa-4";
const TELEGRAM_CHAT_IDS   = [
 "6494169074", //----Otoniel ID
 "926909408",  //----Leo ID
 ]; 

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// ─────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────

/**
 * Construye el texto del mensaje con los datos de la transacción.
 * Telegram acepta hasta 1 024 caracteres en el caption de una foto.
 */
function buildCaption(formData, montoUsd, tasaCambio) {
  const cup = (montoUsd * (tasaCambio || 0)).toLocaleString("es-CU");

  const direccion = [
    formData.recipient_street         ? `Calle ${formData.recipient_street}`           : null,
    formData.recipient_street_between ? `e/ ${formData.recipient_street_between}`       : null,
    formData.recipient_building       ? `Edif. ${formData.recipient_building}`          : null,
    formData.recipient_house_number   ? `# ${formData.recipient_house_number}`          : null,
    formData.recipient_neighborhood   ? `Rpto. ${formData.recipient_neighborhood}`      : null,
    formData.recipient_municipality   || null,
    formData.recipient_province       || null,
  ]
    .filter(Boolean)
    .join(", ");

  const ubicacion =
    formData.recipient_latitude && formData.recipient_longitude
      ? `📍 ${parseFloat(formData.recipient_latitude).toFixed(6)}, ${parseFloat(formData.recipient_longitude).toFixed(6)}`
      : "📍 No especificada";

  return [
    "🔔 *NUEVA TRANSACCIÓN RECIBIDA*",
    "",
    "👤 *Remitente*",
    `• Nombre: ${formData.sender_name}`,
    `• WhatsApp: ${formData.sender_whatsapp}`,
    "",
    "👥 *Destinatario*",
    `• Nombre: ${formData.recipient_name}`,
    `• WhatsApp: ${formData.recipient_whatsapp || "—"}`,
    `• Dirección: ${direccion || "—"}`,
    `• Ubicación GPS: ${ubicacion}`,
    "",
    "💵 *Transferencia*",
    `• Monto: $${montoUsd} USD`,
    `• Tasa: ${tasaCambio || "—"} CUP/USD`,
    `• Total CUP: ${cup} CUP`,
    "",
    "📋 Estado: *Pendiente de revisión*",
  ].join("\n");
}

// ─────────────────────────────────────────────
// API pública del servicio
// ─────────────────────────────────────────────

/**
 * Envía la foto del comprobante con el caption de los datos al bot de Telegram.
 *
 * @param {Object} formData   - Datos del formulario (sender_*, recipient_*, usd_amount…)
 * @param {File}   proofFile  - Archivo de imagen del comprobante
 * @param {number} tasaCambio - Tasa de cambio actual
 * @returns {Promise<void>}
 */
export async function notificarTransaccionTelegram(formData, proofFile, tasaCambio) {
  const montoUsd = parseFloat(formData.usd_amount) || 0;
  const caption  = buildCaption(formData, montoUsd, tasaCambio);

  const body = new FormData();
  body.append("chat_id",    TELEGRAM_CHAT_ID);
  body.append("photo",      proofFile, proofFile.name);
  body.append("caption",    caption);
  body.append("parse_mode", "Markdown");

  const response = await fetch(`${TELEGRAM_API}/sendPhoto`, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Telegram API error ${response.status}: ${err.description ?? "sin detalle"}`,
    );
  }
}