/** Tabla de transacciones del panel: filtros, paginación, cambiar estado */

import { supabaseClient } from "../api/client.js";
import {
  listTransacciones,
  updateState,
  insertLog,
  deleteAll,
} from "../api/transaccionesApi.js";
import { getPanelToast } from "./toast.js";

const Swal = typeof window !== "undefined" ? window.Swal : null;
let paginaActual = 0;
const itemsPorPagina = 10;
let sortColumn = null;
let sortDirection = "asc";

export function resetYPaginación() {
  paginaActual = 0;
}

export function setSort(column) {
  if (sortColumn === column) {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  } else {
    sortColumn = column;
    sortDirection = "asc";
  }
  resetYPaginación();
  cargarTransaccionesPaginadas();
}

export function cambiarPagina(delta, refreshAll) {
  paginaActual += delta;
  if (paginaActual < 0) paginaActual = 0;
  cargarTransaccionesPaginadas(refreshAll);
}

export async function cargarTransacciones(refreshAll) {
  await cargarTransaccionesPaginadas(refreshAll);
}

export async function cargarTransaccionesPaginadas(refreshAll) {
  if (!supabaseClient) return;

  const search = document.getElementById("f-search")?.value ?? "";
  const estado = document.getElementById("f-estado")?.value ?? "todos";
  const inicio = document.getElementById("f-inicio")?.value ?? "";
  const fin = document.getElementById("f-fin")?.value ?? "";

  const {
    data: txs,
    count,
    error,
  } = await listTransacciones({
    search,
    state: estado,
    from: inicio,
    to: fin,
    page: paginaActual,
    pageSize: itemsPorPagina,
  });

  if (error) return;

  const { data: config } = await supabaseClient
    .from("config")
    .select("exchange_rate")
    .single();
  const tasa = config?.exchange_rate || 0;

  // Ordenar transacciones
  let sortedTxs = txs || [];
  if (sortColumn) {
    sortedTxs.sort((a, b) => {
      let aVal, bVal;
      switch (sortColumn) {
        case "sender":
          aVal = a.sender_name.toLowerCase();
          bVal = b.sender_name.toLowerCase();
          break;
        case "recipient":
          aVal = a.recipient_name.toLowerCase();
          bVal = b.recipient_name.toLowerCase();
          break;
        case "whatsapp":
          aVal = a.recipient_whatsapp || "";
          bVal = b.recipient_whatsapp || "";
          break;
        case "usd":
          aVal = a.usd_amount;
          bVal = b.usd_amount;
          break;
        case "cup":
          aVal = a.usd_amount * (a.exchange_rate || tasa);
          bVal = b.usd_amount * (b.exchange_rate || tasa);
          break;
        case "state":
          aVal = a.state;
          bVal = b.state;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  const pageInfo = document.getElementById("page-info");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const totalPages = Math.ceil((count || 0) / itemsPorPagina) || 1;
  if (pageInfo)
    pageInfo.innerText = `Página ${paginaActual + 1} de ${totalPages}`;
  if (btnPrev) btnPrev.disabled = paginaActual === 0;
  if (btnNext)
    btnNext.disabled =
      paginaActual * itemsPorPagina + itemsPorPagina >= (count || 0);

  const tbody = document.querySelector("#tabla-transacciones tbody");
  if (!tbody) return;

  tbody.innerHTML = (sortedTxs || [])
  .map((tx) => {
    const tasaTx = tx.exchange_rate || tasa;
    const cup = (tx.usd_amount * tasaTx).toLocaleString("es-CU");
    const fecha = new Date(tx.creation_date).toLocaleString('es-ES', { 
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    });

    // Enlaces de WhatsApp
    const waRemitente = tx.sender_whatsapp ? tx.sender_whatsapp.replace(/\D/g, "") : "";
    const waDestinatario = tx.recipient_whatsapp ? tx.recipient_whatsapp.replace(/\D/g, "") : "";

    return `
      <tr class="${tx.state === "pending" ? "fila-pendiente" : ""}">
        <td><small>${fecha}</small></td>
        
        <!-- INFO REMITENTE -->
        <td>
          <b>${tx.sender_name}</b><br>
          <a href="https://wa.me/${waRemitente}" target="_blank" style="text-decoration:none; color:#3b82f6; font-size:0.8rem;">
            📱 ${tx.sender_whatsapp || "-"}
          </a>
        </td>

        <!-- INFO DESTINATARIO COMPLETA -->
        <td>
          <b>${tx.recipient_name}</b><br>
          <small>${tx.recipient_province}, ${tx.recipient_municipality}</small><br>
          <a href="https://wa.me/${waDestinatario}" target="_blank" style="text-decoration:none; color:#25D366; font-size:0.8rem;">
            📱 ${tx.recipient_whatsapp || "-"}
          </a>
        </td>

        <td>$${tx.usd_amount}</td>
        <td><small>x${tasaTx}</small></td>
        <td style="color:green; font-weight:bold">${cup} CUP</td>
        
        <td><button onclick="window.verRecibo('${tx.transfer_proof_url || ""}')" class="btn-ver">👁️</button></td>
        
        <td><span class="badge badge-${tx.state}">${(tx.state || "").toUpperCase()}</span></td>
        
        <td>
          ${tx.state === "pending" ? `
            <button onclick="window.cambiarEstado(${tx.id}, 'approved')" style="border:none; background:none; cursor:pointer;">✅</button>
            <button onclick="window.cambiarEstado(${tx.id}, 'rejected')" style="border:none; background:none; cursor:pointer;">❌</button>
          ` : "---"}
        </td>

        <!-- BOTÓN IMPRIMIR TICKET -->
        <td>
          <button onclick='window.imprimirTicket(${JSON.stringify(tx)})' class="btn-ver" style="background: var(--primary); color: white;">
            🖨️
          </button>
        </td>
      </tr>
    `;
  })
  .join("");

  // Actualizar clases de sort en headers
  const ths = document.querySelectorAll("#tabla-transacciones th");
  ths.forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
  });
  if (sortColumn) {
    const thId = `th-${sortColumn}`;
    const th = document.getElementById(thId);
    if (th) {
      th.classList.add(sortDirection === "asc" ? "sort-asc" : "sort-desc");
    }
  }
}

export async function cambiarEstado(id, nuevoEstado, refreshAll) {
  const { error } = await updateState(id, nuevoEstado);
  if (error) return;
  await insertLog({
    transaccion_id: id,
    accion: `state: ${nuevoEstado}`,
    usuario_admin: "Admin",
    comentario: `Marcada como ${nuevoEstado} manualmente`,
  });
  const Toast = getPanelToast();
  if (Toast)
    Toast.fire({ icon: "success", title: `Transacción ${nuevoEstado}` });
  if (typeof refreshAll === "function") await refreshAll();
}

export async function borrarTodasTransacciones(refreshAll) {
  if (!confirm("⚠️ ¿Eliminar todo el historial?")) return;
  const { error } = await deleteAll();
  const Toast = getPanelToast();
  if (error) {
    if (Toast) Toast.fire({ icon: "error", title: "Error" });
    return;
  }
  if (Toast) Toast.fire({ icon: "success", title: "Base de datos limpia" });
  if (typeof refreshAll === "function") await refreshAll();
}

export function verRecibo(url) {
  const Toast = getPanelToast();
  if (!url || url === "undefined" || url === "") {
    if (Toast) Toast.fire({ icon: "error", title: "No hay imagen disponible" });
    return;
  }
  if (Swal) {
    Swal.fire({
      imageUrl: url,
      imageAlt: "Comprobante de transferencia",
      showCloseButton: true,
      showConfirmButton: false,
      width: "auto",
      maxHeight: "90vh",
      background: "rgba(255, 255, 255, 0.9)",
      backdrop: "rgba(15, 23, 42, 0.8)",
      customClass: { image: "img-recibo-modal" },
    });
  }
}

export async function exportarCSV() {
  if (!supabaseClient) return;
  const { data } = await supabaseClient
    .from("transacciones")
    .select("*")
    .eq("state", "approved");
  let csv = "Fecha,Remitente,Beneficiario,Monto USD\n";
  (data || []).forEach(
    (r) =>
      (csv += `${r.creation_date || ""},${r.sender_name || ""},${r.recipient_name || ""},${r.usd_amount || ""}\n`),
  );
  const link = document.createElement("a");
  link.href = encodeURI("data:text/csv;charset=utf-8," + csv);
  link.download = "reporte.csv";
  link.click();
}

export function imprimirTicket(tx) {
  const tasaUsada = tx.exchange_rate || 0;
  const cupTotal = (tx.usd_amount * tasaUsada).toLocaleString("es-CU");
  const fecha = new Date(tx.creation_date).toLocaleString();

  const ventanaPrensa = window.open('', '', 'width=600,height=800');
  
  ventanaPrensa.document.write(`
    <html>
      <head>
        <title>Ticket Onyx - ${tx.id}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #333; }
          .ticket { max-width: 300px; margin: auto; border: 1px solid #ccc; padding: 15px; }
          .header { text-align: center; border-bottom: 1px dashed #000; margin-bottom: 10px; padding-bottom: 10px; }
          .section { margin-bottom: 10px; font-size: 12px; }
          .label { font-weight: bold; text-transform: uppercase; display: block; font-size: 10px; color: #666; }
          .total-box { background: #f0f0f0; padding: 10px; text-align: center; margin-top: 10px; border: 1px solid #000; }
          .footer { text-align: center; font-size: 10px; margin-top: 20px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h2 style="margin:0;">ONYX TRANSFER</h2>
            <p style="margin:0; font-size:12px;">Comprobante de Envío</p>
            <small>ID: TX-${tx.id}</small>
          </div>

          <div class="section">
            <span class="label">Fecha:</span>
            ${fecha}
          </div>

          <div class="section">
            <span class="label">Remitente:</span>
            ${tx.sender_name}<br>
            WA: ${tx.sender_whatsapp}
          </div>

          <div class="section" style="border-top: 1px dashed #eee; padding-top: 5px;">
            <span class="label">Beneficiario:</span>
            ${tx.recipient_name}<br>
            WA: ${tx.recipient_whatsapp}<br>
            Loc: ${tx.recipient_province}, ${tx.recipient_municipality}
          </div>

          <div class="total-box">
            <span class="label">Total a Entregar:</span>
            <strong style="font-size: 18px;">${cupTotal} CUP</strong><br>
            <small>Tasa: 1 USD x ${tasaUsada} CUP</small><br>
            <small>Monto: ${tx.usd_amount} USD</small>
          </div>

          <div class="footer">
            ¡Gracias por confiar en nosotros!<br>
            www.onyxtransfer.com
          </div>
        </div>
        <div class="no-print" style="text-align:center; margin-top:20px;">
          <button onclick="window.print();">Confirmar Impresión</button>
        </div>
      </body>
    </html>
  `);
  
  ventanaPrensa.document.close();
}

// IMPORTANTE: Exponer la función al objeto window en panelMain.js o aquí mismo
window.imprimirTicket = imprimirTicket;