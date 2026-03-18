/** Toast para el panel admin (Swal mixin) */

export function createPanelToast() {
  if (typeof window === "undefined" || !window.Swal) return null;
  return window.Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
  });
}

let _toast = null;
export function getPanelToast() {
  if (!_toast) _toast = createPanelToast();
  return _toast;
}
