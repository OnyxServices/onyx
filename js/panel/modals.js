/** Modales del panel: abrir/cerrar por id */

export function abrirModal(id, onOpen) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = "block";
    if (typeof onOpen === "function") onOpen(id);
  }
}

export function cerrarModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

export function setupGlobalModalClose() {
  window.onclick = (e) => {
    if (e.target.className === "modal") e.target.style.display = "none";
  };
}
