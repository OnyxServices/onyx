/**
 * ORQUESTRADOR: Coordina la tabla de transacciones del panel
 *
 * Responsabilidades:
 * - Mantener estado: paginación, ordenamiento, filtros
 * - Leer datos del DOM (filtros)
 * - Llamar a servicios
 * - Manejar cambios de estado
 * - Llamar a funciones UI pasivas
 */

import {
  listTransactions,
  updateTransaction,
} from "../services/transactionService.js";
import { getAll as getConfigAll } from "../api/configApi.js";
import { getPanelToast } from "../ui/utils/panelToast.js";
import { showImageModal } from "../ui/utils/swalUtils.js";
import { renderTransaccionesTable } from "../ui/components/panel/panelTransaccionesTable.js";

// ESTADO LOCAL: Paginación y ordenamiento
let paginaActual = 0;
const itemsPorPagina = 10;
let sortColumn = null;
let sortDirection = "asc";

/**
 * Resetea la paginación
 */
export function resetYPaginación() {
  paginaActual = 0;
}

/**
 * Cambia el ordenamiento
 */
export function setSort(column) {
  if (sortColumn === column) {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  } else {
    sortColumn = column;
    sortDirection = "asc";
  }
  resetYPaginación();
  orchestrateLoadTransactions();
}

/**
 * Cambia de página
 */
export function cambiarPagina(delta, refreshAll) {
  paginaActual += delta;
  if (paginaActual < 0) paginaActual = 0;
  orchestrateLoadTransactions(refreshAll);
}

/**
 * Orquesta la carga de transacciones
 */
export async function cargarTransacciones(refreshAll) {
  await orchestrateLoadTransactions(refreshAll);
}

/**
 * Orquesta el flujo completo: leer filtros → servicio → UI
 */
export async function orchestrateLoadTransactions(refreshAll) {
  try {
    // 1. Leer filtros del DOM
    const search = document.getElementById("f-search")?.value ?? "";
    const estado = document.getElementById("f-estado")?.value ?? "todos";
    const inicio = document.getElementById("f-inicio")?.value ?? "";
    const fin = document.getElementById("f-fin")?.value ?? "";

    // 2. Llamar a servicios (puros)
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

    if (error) {
      console.error("Error al cargar transacciones:", error);
      return;
    }

    // 3. Obtener tasa de cambio
    const cfgResp = await getConfigAll({ limit: 1 });
    let tasa = 0;
    if (cfgResp && cfgResp.data) {
      const cfg = cfgResp.data;
      tasa = Array.isArray(cfg)
        ? cfg[0]?.exchange_rate || 0
        : cfg.exchange_rate || 0;
    }

    // 4. Ordenar transacciones
    let sortedTxs = txs || [];
    if (sortColumn) {
      sortedTxs = sortTransactions(sortedTxs, sortColumn, sortDirection, tasa);
    }

    // 5. Actualizar paginación en DOM
    updatePaginationUI(count);

    // 6. Llamar a función UI pasiva para renderizar tabla
    renderTransaccionesTable(sortedTxs, tasa, {
      sortColumn,
      sortDirection,
    });
  } catch (error) {
    console.error("❌ Error orquestando carga de transacciones:", error);
  }
}

/**
 * Función pura: Ordena transacciones
 */
function sortTransactions(txs, column, direction, tasa) {
  return [...txs].sort((a, b) => {
    let aVal, bVal;
    switch (column) {
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
    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Actualiza UI de paginación
 */
function updatePaginationUI(count) {
  const pageInfo = document.getElementById("page-info");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const totalPages = Math.ceil((count || 0) / itemsPorPagina) || 1;

  if (pageInfo) pageInfo.innerText = `${paginaActual + 1} de ${totalPages}`;
  if (btnPrev) btnPrev.disabled = paginaActual === 0;
  if (btnNext)
    btnNext.disabled =
      paginaActual * itemsPorPagina + itemsPorPagina >= (count || 0);
}

/**
 * Orquesta el cambio de estado de transacción
 */
export async function cambiarEstado(id, nuevoEstado, refreshAll) {
  try {
    const res = await updateTransaction(id, { state: nuevoEstado });
    if (res?.error) throw new Error(res.error);

    const Toast = getPanelToast();
    if (Toast)
      Toast.fire({ icon: "success", title: `Transacción ${nuevoEstado}` });

    if (typeof refreshAll === "function") await refreshAll();
  } catch (error) {
    console.error("❌ Error al cambiar estado:", error);
    const Toast = getPanelToast();
    if (Toast)
      Toast.fire({ icon: "error", title: "Error al actualizar estado" });
  }
}

/**
 * Muestra recibo (imagen modal)
 */
export function verRecibo(url) {
  const Toast = getPanelToast();
  if (!url || url === "undefined" || url === "") {
    if (Toast) Toast.fire({ icon: "error", title: "No hay imagen disponible" });
    return;
  }
  showImageModal(url, "Comprobante de transferencia");
}

/**
 * Exporta transacciones a CSV
 */
export async function exportarCSV() {
  try {
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
  } catch (error) {
    console.error("❌ Error al exportar CSV:", error);
    const Toast = getPanelToast();
    if (Toast) Toast.fire({ icon: "error", title: "Error al exportar" });
  }
}
