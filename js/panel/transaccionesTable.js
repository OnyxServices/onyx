/** Tabla de transacciones del panel: filtros, paginación, cambiar estado */

import {
  listTransactions,
  updateTransaction,
} from "../services/transactionService.js";
import { getAll as getConfigAll } from "../api/configApi.js";
import { getPanelToast } from "./toast.js";
import { showImageModal } from "../ui/utils/swalUtils.js";

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
  const search = document.getElementById("f-search")?.value ?? "";
  const estado = document.getElementById("f-estado")?.value ?? "todos";
  const inicio = document.getElementById("f-inicio")?.value ?? "";
  const fin = document.getElementById("f-fin")?.value ?? "";

  const {
    data: txs,
    count,
    error,
  } = await listTransactions({
    search,
    state: estado,
    from: inicio,
    to: fin,
    page: paginaActual,
    pageSize: itemsPorPagina,
  });

  if (error) return;

  const cfgResp = await getConfigAll({ limit: 1 });
  let tasa = 0;
  if (cfgResp && cfgResp.data) {
    const cfg = cfgResp.data;
    tasa = Array.isArray(cfg)
      ? cfg[0]?.exchange_rate || 0
      : cfg.exchange_rate || 0;
  }

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
  if (pageInfo) pageInfo.innerText = `${paginaActual + 1} de ${totalPages}`;
  if (btnPrev) btnPrev.disabled = paginaActual === 0;
  if (btnNext)
    btnNext.disabled =
      paginaActual * itemsPorPagina + itemsPorPagina >= (count || 0);

  const tbody = document.querySelector("#tabla-transacciones tbody");
  if (!tbody) return;

  tbody.innerHTML = (sortedTxs || [])
    .map((tx) => {
      const cup = (tx.usd_amount * (tx.exchange_rate || tasa)).toLocaleString(
        "es-CU",
      );
      const waLink = tx.recipient_whatsapp
        ? tx.recipient_whatsapp.replace(/\D/g, "")
        : "";
      const province = tx.recipient_province || "";

      // Construir dirección completa
      const addressParts = [];
      if (tx.recipient_street) addressParts.push(tx.recipient_street);
      if (tx.recipient_street_between)
        addressParts.push(`entre ${tx.recipient_street_between}`);
      if (tx.recipient_building) addressParts.push(tx.recipient_building);
      if (tx.recipient_house_number)
        addressParts.push(`#${tx.recipient_house_number}`);
      const address = addressParts.join(", ");

      return `
        <tr class="${tx.state === "pending" ? "fila-pendiente" : ""}">
          <td>${tx.sender_name}</td>
          <td><b>${tx.recipient_name}</b><br><small>${province}</small></td>
          <td><button class="btn-details" onclick="window.abrirDetallesTransaccion(${tx.id})" title="Ver detalles">📍 ${address || "Ver"}</button></td>
          <td>
            <a href="https://wa.me/${waLink}" target="_blank" style="text-decoration:none; color:#25D366; font-weight:bold;">
              📱 ${tx.recipient_whatsapp || "-"}
            </a>
          </td>
          <td>$${tx.usd_amount}</td>
          <td style="color:green; font-weight:bold">${cup} CUP</td>
          <td><button onclick="window.verRecibo('${tx.transfer_proof_url || ""}')" class="btn-ver">👁️ Ver</button></td>
          <td><span class="badge badge-${tx.state}">${(tx.state || "").toUpperCase()}</span></td>
          <td>
            ${
              tx.state === "pending"
                ? `
              <button onclick="window.cambiarEstado(${tx.id}, 'approved')">✅</button>
              <button onclick="window.cambiarEstado(${tx.id}, 'rejected')">❌</button>
            `
                : "---"
            }
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
  const res = await updateTransaction(id, { state: nuevoEstado });
  const error = res?.error ?? null;
  if (error) return;
  const Toast = getPanelToast();
  if (Toast)
    Toast.fire({ icon: "success", title: `Transacción ${nuevoEstado}` });
  if (typeof refreshAll === "function") await refreshAll();
}

export function verRecibo(url) {
  const Toast = getPanelToast();
  if (!url || url === "undefined" || url === "") {
    if (Toast) Toast.fire({ icon: "error", title: "No hay imagen disponible" });
    return;
  }
  showImageModal(url, "Comprobante de transferencia");
}

export async function exportarCSV() {
  const { data } = await listTransactions({
    state: "approved",
    pageSize: null,
  });
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
