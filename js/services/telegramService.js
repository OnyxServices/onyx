/**
 * Servicio de notificaciones: envía datos de transacción al bot de Telegram.
 * Soporta múltiples destinatarios (grupos, canales, chats privados).
 *
 * ⚙️  CONFIGURACIÓN — reemplaza estos valores antes de usar:
 */
const TELEGRAM_BOT_TOKEN = "8608347138:AAEKQu_alalb28XFZt1vU-WCcXOii-eSa-4";

// Agrega o quita IDs según necesites (grupos llevan el signo negativo)
const TELEGRAM_CHAT_IDS = [
  "6494169074",   // Oto
  "926909408",   // Leo
];

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// ─────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────

/**
 * Construye el texto del mensaje con los datos de la transacción.
 */
function buildCaption(formData, montoUsd, tasaCambio) {
  const cup = (montoUsd * (tasaCambio || 0)).toLocaleString("es-CU");

  const direccion = [
    formData.recipient_street         ? `Calle ${formData.recipient_street}`       : null,
    formData.recipient_street_between ? `e/ ${formData.recipient_street_between}`  : null,
    formData.recipient_building       ? `Edif. ${formData.recipient_building}`      : null,
    formData.recipient_house_number   ? `# ${formData.recipient_house_number}`      : null,
    formData.recipient_neighborhood   ? `Rpto. ${formData.recipient_neighborhood}`  : null,
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

/**
 * Envía la foto a un único chat ID.
 * Devuelve un objeto { chatId, ok, error? } para poder rastrear cuál falló.
 */
async function enviarAChat(chatId, proofFile, caption) {
  try {
    const body = new FormData();
    body.append("chat_id",    chatId);
    body.append("photo",      proofFile, proofFile.name);
    body.append("caption",    caption);
    body.append("parse_mode", "Markdown");

    const response = await fetch(`${TELEGRAM_API}/sendPhoto`, {
      method: "POST",
      body,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        chatId,
        ok: false,
        error: `HTTP ${response.status}: ${err.description ?? "sin detalle"}`,
      };
    }

    return { chatId, ok: true };
  } catch (err) {
    return { chatId, ok: false, error: err.message };
  }
}

// ─────────────────────────────────────────────
// API pública del servicio
// ─────────────────────────────────────────────

/**
 * Envía la foto del comprobante con el caption a TODOS los chats configurados.
 * Los envíos se hacen en paralelo. Si alguno falla, se loguea pero no interrumpe
 * los demás ni revierte la transacción en la base de datos.
 *
 * @param {Object} formData   - Datos del formulario
 * @param {File}   proofFile  - Imagen del comprobante
 * @param {number} tasaCambio - Tasa de cambio actual
 */
export async function notificarTransaccionTelegram(formData, proofFile, tasaCambio) {
  const montoUsd = parseFloat(formData.usd_amount) || 0;
  const caption  = buildCaption(formData, montoUsd, tasaCambio);

  // Enviar a todos los chats en paralelo
  const resultados = await Promise.all(
    TELEGRAM_CHAT_IDS.map((chatId) => enviarAChat(chatId, proofFile, caption)),
  );

  // Loguear resultado por chat
  resultados.forEach(({ chatId, ok, error }) => {
    if (ok) {
      console.log(`✅ Telegram OK → chat ${chatId}`);
    } else {
      console.warn(`⚠️ Telegram FAIL → chat ${chatId}:`, error);
    }
  });
}
