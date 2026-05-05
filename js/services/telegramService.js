/**
 * TelegramNotificationService
 * Clase profesional para la gestión de notificaciones vía Telegram Bot API.
 */
class TelegramNotificationService {
  constructor(token, chatIds) {
    if (!token) throw new Error("Telegram Bot Token es requerido.");
    this.token = token;
    this.chatIds = Array.isArray(chatIds) ? chatIds : [chatIds];
    this.apiUrl = `https://api.telegram.org/bot${this.token}/sendPhoto`;
  }

  /**
   * Formatea valores monetarios según el estándar regional.
   */
  #formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("es-CU", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Construye la dirección de forma dinámica filtrando campos vacíos.
   */
  #formatAddress(data) {
    const parts = [
      data.recipient_street ? `Calle ${data.recipient_street}` : null,
      data.recipient_street_between ? `e/ ${data.recipient_street_between}` : null,
      data.recipient_building ? `Edif. ${data.recipient_building}` : null,
      data.recipient_house_number ? `# ${data.recipient_house_number}` : null,
      data.recipient_neighborhood ? `Rpto. ${data.recipient_neighborhood}` : null,
      data.recipient_municipality,
      data.recipient_province,
    ];

    return parts.filter(Boolean).join(", ") || "Dirección no proporcionada";
  }

  /**
   * Construye el cuerpo del mensaje (Caption) con formato Markdown profesional.
   */
  #buildCaption(formData, tasaCambio) {
    const montoUsd = parseFloat(formData.usd_amount) || 0;
    const totalCup = montoUsd * (parseFloat(tasaCambio) || 0);
    const ubicacionGps = formData.recipient_latitude && formData.recipient_longitude
      ? `[Ver en Mapa](https://www.google.com/maps?q=${formData.recipient_latitude},${formData.recipient_longitude})`
      : "No especificada";

    return [
      "✨ *NUEVA TRANSACCIÓN REGISTRADA*",
      "───────────────────────",
      "👤 *INFORMACIÓN DEL REMITENTE*",
      `*Nombre:* ${formData.sender_name}`,
      `*WhatsApp:* [${formData.sender_whatsapp}](https://wa.me/${formData.sender_whatsapp.replace(/\D/g, '')})`,
      "",
      "👥 *DATOS DEL DESTINATARIO*",
      `*Nombre:* ${formData.recipient_name}`,
      `*Teléfono:* ${formData.recipient_whatsapp || "No provisto"}`,
      `*Dirección:* ${this.#formatAddress(formData)}`,
      `*GPS:* ${ubicacionGps}`,
      "",
      "💰 *DETALLES DEL PAGO*",
      `*Monto:* ${this.#formatCurrency(montoUsd, "USD")}`,
      `*Tasa aplicada:* ${tasaCambio} CUP`,
      `*Total a entregar:* ${this.#formatCurrency(totalCup, "CUP")}`,
      "───────────────────────",
      "📋 *ESTADO:* `PENDIENTE DE VERIFICACIÓN` ⏳",
    ].join("\n");
  }

  /**
   * Realiza el envío individual a un Chat ID específico.
   */
  async #dispatch(chatId, proofFile, caption) {
    try {
      const formData = new FormData();
      formData.append("chat_id", chatId);
      formData.append("photo", proofFile);
      formData.append("caption", caption);
      formData.append("parse_mode", "Markdown");

      const response = await fetch(this.apiUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.description || "Error desconocido en Telegram");
      }

      return { chatId, success: true };
    } catch (error) {
      return { chatId, success: false, error: error.message };
    }
  }

  /**
   * Método público: Notifica a todos los destinatarios configurados.
   */
  async notify(formData, proofFile, tasaCambio) {
    console.log("🚀 Iniciando servicio de notificación...");
    
    const caption = this.#buildCaption(formData, tasaCambio);
    
    // Ejecución en paralelo de todos los envíos
    const promises = this.chatIds.map(id => this.#dispatch(id, proofFile, caption));
    const results = await Promise.all(promises);

    // Resumen de operaciones
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    console.log(`📊 Informe: ${successCount} enviados, ${failCount} fallidos.`);
    
    results.forEach(res => {
      if (!res.success) {
        console.error(`❌ Error en Chat ID ${res.chatId}: ${res.error}`);
      }
    });

    return results;
  }
}

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN Y EJECUCIÓN
// ─────────────────────────────────────────────────────────────

const CONFIG = {
  BOT_TOKEN: "8608347138:AAEKQu_alalb28XFZt1vU-WCcXOii-eSa-4",
  RECIPIENTS: ["6494169074", "926909408"]
};

/**
 * Función de exportación para uso externo
 */
export async function notificarTransaccionTelegram(formData, proofFile, tasaCambio) {
  try {
    const telegram = new TelegramNotificationService(CONFIG.BOT_TOKEN, CONFIG.RECIPIENTS);
    return await telegram.notify(formData, proofFile, tasaCambio);
  } catch (error) {
    console.error("🚨 Error crítico en el servicio de Telegram:", error.message);
  }
}