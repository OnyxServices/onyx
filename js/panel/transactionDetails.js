/** Panel detalles de transacción: mapa, dirección, comprobante PDF y envío WhatsApp */

import { supabaseClient } from "../api/client.js";
import { getPanelToast } from "./toast.js";

const Swal = typeof window !== "undefined" ? window.Swal : null;

let currentTransaction = null;
let detailsMap = null;

export async function abrirDetallesTransaccion(transactionId) {
  const { data, error } = await supabaseClient
    .from("transacciones")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (error) {
    const Toast = getPanelToast();
    if (Toast) Toast.fire({ icon: "error", title: "Error al cargar datos" });
    return;
  }

  currentTransaction = data;
  cargarDetallesEnModal(data);
  const modal = document.getElementById("modal-details");
  if (modal) modal.style.display = "flex";
}

function cargarDetallesEnModal(tx) {
  // Información del remitente
  document.getElementById("det-sender").innerText = tx.sender_name || "-";
  document.getElementById("det-sender-wa").innerText =
    tx.sender_whatsapp || "-";

  // Información del destinatario
  document.getElementById("det-recipient").innerText = tx.recipient_name || "-";
  document.getElementById("det-recipient-wa").innerText =
    tx.recipient_whatsapp || "-";

  // Dirección completa
  const addressParts = [];
  if (tx.recipient_street) addressParts.push(`Calle: ${tx.recipient_street}`);
  if (tx.recipient_street_between)
    addressParts.push(`Entre calles: ${tx.recipient_street_between}`);
  if (tx.recipient_building)
    addressParts.push(`Edificio: ${tx.recipient_building}`);
  if (tx.recipient_house_number)
    addressParts.push(`Número: ${tx.recipient_house_number}`);
  if (tx.recipient_neighborhood)
    addressParts.push(`Reparto: ${tx.recipient_neighborhood}`);
  if (tx.recipient_province)
    addressParts.push(`Provincia: ${tx.recipient_province}`);
  if (tx.recipient_municipality)
    addressParts.push(`Municipio: ${tx.recipient_municipality}`);

  const addressEl = document.getElementById("det-address");
  addressEl.innerHTML =
    addressParts.length > 0
      ? addressParts.map((p) => `<p style="margin: 5px 0;">${p}</p>`).join("")
      : "<p>No hay información de dirección disponible</p>";

  // Inicializar mapa si hay coordenadas
  const mapContainer = document.getElementById("det-map-container");
  if (tx.recipient_latitude && tx.recipient_longitude) {
    mapContainer.style.display = "block";
    inicializarMapaDetalles(tx.recipient_latitude, tx.recipient_longitude);
  } else {
    mapContainer.style.display = "none";
  }
}

function inicializarMapaDetalles(lat, lng) {
  if (detailsMap) {
    detailsMap.remove();
  }

  detailsMap = L.map("det-map").setView([lat, lng], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(detailsMap);

  L.marker([lat, lng])
    .addTo(detailsMap)
    .bindPopup(`<b>${currentTransaction.recipient_name}</b>`);
}

export function generarPDF() {
  if (!currentTransaction) return;

  const tx = currentTransaction;
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

  const element = document.createElement("div");
  element.innerHTML = htmlContent;

  const opt = {
    margin: 10,
    filename: `comprobante-${tx.id}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
  };

  html2pdf().set(opt).from(htmlContent).save();

  const Toast = getPanelToast();
  if (Toast)
    Toast.fire({ icon: "success", title: "PDF generado correctamente" });
}

export async function enviarWA_Remitente() {
  if (!currentTransaction) return;

  const tx = currentTransaction;
  const senderWA = tx.sender_whatsapp?.replace(/\D/g, "") || "";

  if (!senderWA) {
    const Toast = getPanelToast();
    if (Toast)
      Toast.fire({
        icon: "error",
        title: "No hay número de WhatsApp del remitente",
      });
    return;
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

  const Toast = getPanelToast();

  // Enviar al remitente
  const urlRemitente = `https://wa.me/${senderWA}?text=${encodeURIComponent(
    `Hola ${tx.sender_name}, ${mensajeTexto}`,
  )}`;
  window.open(urlRemitente, "_blank");

  if (Toast)
    Toast.fire({
      icon: "success",
      title: "Abriendo WhatsApp del remitente...",
    });
}

export async function enviarWA_Destinatario() {
  if (!currentTransaction) return;

  const tx = currentTransaction;
  const recipientWA = tx.recipient_whatsapp?.replace(/\D/g, "") || "";

  if (!recipientWA) {
    const Toast = getPanelToast();
    if (Toast)
      Toast.fire({
        icon: "error",
        title: "No hay número de WhatsApp del destinatario",
      });
    return;
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

  const Toast = getPanelToast();

  // Enviar al destinatario
  const urlDestinatario = `https://wa.me/${recipientWA}?text=${encodeURIComponent(
    `Hola ${tx.recipient_name}, ${mensajeTexto}`,
  )}`;
  window.open(urlDestinatario, "_blank");

  if (Toast)
    Toast.fire({
      icon: "success",
      title: "Abriendo WhatsApp del destinatario...",
    });
}
