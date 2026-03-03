/** Servicio: Lógica de negocio de detalles de transacción (PDF, WhatsApp) */

/**
 * Genera un PDF con los detalles de la transacción
 */
export async function generarPDFTransaccion(tx) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Comprobante de Transferencia</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .container {
          border: 2px solid #00a9ff;
          padding: 30px;
          border-radius: 10px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #00a9ff;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #00a9ff;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          color: #666;
          margin: 5px 0;
        }
        .section {
          margin-bottom: 20px;
        }
        .section h3 {
          color: #00a9ff;
          margin-top: 0;
          font-size: 14px;
          text-transform: uppercase;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .label {
          font-weight: bold;
          color: #333;
          flex: 1;
        }
        .value {
          color: #666;
          text-align: right;
          flex: 1;
        }
        .highlight {
          background: rgba(0, 169, 255, 0.1);
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #999;
          font-size: 12px;
        }
        .amount-big {
          font-size: 24px;
          font-weight: bold;
          color: #00a9ff;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>COMPROBANTE DE TRANSFERENCIA</h1>
          <p>Onyx Transfer - Remesas a Cuba</p>
          <p>Referencia: TX-${tx.id}</p>
        </div>

        <div class="section">
          <h3>Información de la Transferencia</h3>
          <div class="row">
            <span class="label">Fecha:</span>
            <span class="value">${new Date(tx.creation_date).toLocaleDateString("es-CU")}</span>
          </div>
          <div class="row">
            <span class="label">Monto Enviado:</span>
            <span class="value">$${tx.usd_amount} USD</span>
          </div>
          <div class="row">
            <span class="label">Monto a Recibir:</span>
            <span class="value">${(tx.usd_amount * (tx.exchange_rate || 24)).toLocaleString("es-CU")} CUP</span>
          </div>
        </div>

        <div class="section">
          <h3>Información del Remitente</h3>
          <div class="row">
            <span class="label">Nombre:</span>
            <span class="value">${tx.sender_name || "-"}</span>
          </div>
          <div class="row">
            <span class="label">WhatsApp:</span>
            <span class="value">${tx.sender_whatsapp || "-"}</span>
          </div>
        </div>

        <div class="section">
          <h3>Información del Destinatario</h3>
          <div class="row">
            <span class="label">Nombre:</span>
            <span class="value">${tx.recipient_name || "-"}</span>
          </div>
          <div class="row">
            <span class="label">WhatsApp:</span>
            <span class="value">${tx.recipient_whatsapp || "-"}</span>
          </div>
          <div class="row">
            <span class="label">Provincia:</span>
            <span class="value">${tx.recipient_province || "-"}</span>
          </div>
          <div class="row">
            <span class="label">Municipio:</span>
            <span class="value">${tx.recipient_municipality || "-"}</span>
          </div>
        </div>

        <div class="section">
          <h3>Dirección de Entrega</h3>
          <div class="row value">
          ${tx.recipient_street ? `Calle ${tx.recipient_street}, ` : ""}
          ${tx.recipient_street_between ? `${"\/"} ${tx.recipient_street_between}, ` : ""}
          ${tx.recipient_building ? `Edificio ${tx.recipient_building}, ` : ""}
          ${tx.recipient_house_number ? `# ${tx.recipient_house_number}, ` : ""}
          ${tx.recipient_neighborhood ? `Reparto ${tx.recipient_neighborhood}, ` : ""}
          ${tx.recipient_municipality ? `${tx.recipient_municipality}, ` : ""}
          ${tx.recipient_province ? `${tx.recipient_province}` : ""}
          </div>
        </div>

        <div class="footer">
          <p>Gracias por confiar en nosotros</p>
          <p>Para soporte: contactáctanos a través de WhatsApp (59087957)</p>
          <p>Documento generado: ${new Date().toLocaleString("es-CU")}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const opt = {
    margin: 10,
    filename: `comprobante-${tx.id}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
  };

  html2pdf().set(opt).from(htmlContent).save();
}

/**
 * Envía mensaje por WhatsApp a remitente o destinatario
 */
export async function enviarWhatsAppTransaccion(tx, tipo = "remitente") {
  if (tipo === "remitente") {
    const senderWA = tx.sender_whatsapp?.replace(/\D/g, "") || "";

    if (!senderWA) {
      throw new Error("No hay número de WhatsApp del remitente");
    }

    // Concatenar dirección en una sola línea
    const addressParts = [];
    if (tx.recipient_street) addressParts.push(tx.recipient_street);
    if (tx.recipient_street_between)
      addressParts.push(`entre ${tx.recipient_street_between}`);
    if (tx.recipient_building) addressParts.push(tx.recipient_building);
    if (tx.recipient_house_number)
      addressParts.push(`#${tx.recipient_house_number}`);
    if (tx.recipient_neighborhood) addressParts.push(tx.recipient_neighborhood);
    if (tx.recipient_province) addressParts.push(tx.recipient_province);
    if (tx.recipient_municipality) addressParts.push(tx.recipient_municipality);
    const fullAddress = addressParts.join(", ");

    const mensajeTexto = `
🎉 ¡Tu transferencia ha sido enviada!

Información de la Transacción:
• Referencia: TX-${tx.id}
• Monto: $${tx.usd_amount} USD
• Recibido: ${(tx.usd_amount * (tx.exchange_rate || 24)).toLocaleString("es-CU")} CUP

Destinatario: ${tx.recipient_name}
Dirección: ${fullAddress}

Gracias por confiar en nosotros
`.trim();

    const urlRemitente = `https://wa.me/${senderWA}?text=${encodeURIComponent(
      `Hola ${tx.sender_name}, ${mensajeTexto}`,
    )}`;
    window.open(urlRemitente, "_blank");
  } else if (tipo === "destinatario") {
    const recipientWA = tx.recipient_whatsapp?.replace(/\D/g, "") || "";

    if (!recipientWA) {
      throw new Error("No hay número de WhatsApp del destinatario");
    }

    // Concatenar dirección en una sola línea
    const addressParts = [];
    if (tx.recipient_street) addressParts.push(tx.recipient_street);
    if (tx.recipient_street_between)
      addressParts.push(`entre ${tx.recipient_street_between}`);
    if (tx.recipient_building) addressParts.push(tx.recipient_building);
    if (tx.recipient_house_number)
      addressParts.push(`#${tx.recipient_house_number}`);
    if (tx.recipient_neighborhood) addressParts.push(tx.recipient_neighborhood);
    if (tx.recipient_province) addressParts.push(tx.recipient_province);
    if (tx.recipient_municipality) addressParts.push(tx.recipient_municipality);
    const fullAddress = addressParts.join(", ");

    const mensajeTexto = `
🎉 ¡Tu transferencia ha sido recibida!

Información de la Transacción:
• Referencia: TX-${tx.id}
• Monto: $${tx.usd_amount} USD
• Recibido: ${(tx.usd_amount * (tx.exchange_rate || 24)).toLocaleString("es-CU")} CUP

Remitente: ${tx.sender_name}
Dirección de entrega: ${fullAddress}

¡Tu dinero está en camino! 
Gracias por confiar en nosotros
`.trim();

    const urlDestinatario = `https://wa.me/${recipientWA}?text=${encodeURIComponent(
      `Hola ${tx.recipient_name}, ${mensajeTexto}`,
    )}`;
    window.open(urlDestinatario, "_blank");
  }
}
