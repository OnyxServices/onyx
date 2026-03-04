/**
 * COMPONENTE UI: Tabla de transacciones del panel
 *
 * SOLO funciones PASIVAS que:
 * - Reciben datos por parámetros
 * - Actualizan el DOM
 * - NO hacen llamadas a servicios
 * - NO tienen lógica de obtención de datos
 *
 * La orquestación (servicios + paginación) va en panelTransaccionesController.js
 */

/**
 * Función PASIVA: Renderiza la tabla con transacciones
 * @param {Array} txs - Array de transacciones
 * @param {number} tasa - Tasa de cambio
 * @param {Object} options - { sortColumn, sortDirection }
 */
export function renderTransaccionesTable(txs, tasa, options = {}) {
  const { sortColumn, sortDirection } = options;

  const tbody = document.querySelector("#tabla-transacciones tbody");
  if (!tbody) return;

  tbody.innerHTML = (txs || [])
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
