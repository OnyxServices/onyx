/** Toast (Swal mixin) para notificaciones. Requiere window.Swal. */

export function createToast() {
  if (typeof window === "undefined" || !window.Swal) return null;
  return window.Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    background: "#1e2332",
    color: "#fff",
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", window.Swal.stopTimer);
      toast.addEventListener("mouseleave", window.Swal.resumeTimer);
    },
  });
}

let _toast = null;
export function getToast() {
  if (!_toast) _toast = createToast();
  return _toast;
}
