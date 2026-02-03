/** Utilidades para SweetAlert2: centralizar configuraciones comunes para evitar repetición */

const Swal = typeof window !== "undefined" ? window.Swal : null;

/**
 * Muestra una alerta de advertencia con configuración estándar
 * @param {string} title - Título de la alerta
 * @param {string} text - Texto de la alerta
 */
export function showWarning(title, text) {
  if (Swal) {
    Swal.fire({
      icon: "warning",
      title,
      text,
      background: "#1e2332",
      color: "#fff",
      confirmButtonColor: "var(--primary)",
    });
  }
}

/**
 * Muestra una alerta de error con configuración estándar
 * @param {string} title - Título de la alerta
 * @param {string} text - Texto de la alerta
 */
export function showError(title, text) {
  if (Swal) {
    Swal.fire({
      icon: "error",
      title,
      text,
      background: "#1e2332",
      color: "#fff",
      confirmButtonColor: "var(--primary)",
    });
  }
}

/**
 * Muestra una alerta de éxito con configuración estándar
 * @param {string} title - Título de la alerta
 * @param {string} text - Texto de la alerta
 */
export function showSuccess(title, text) {
  if (Swal) {
    Swal.fire({
      icon: "success",
      title,
      text,
      background: "#1e2332",
      color: "#fff",
      confirmButtonColor: "var(--primary)",
    });
  }
}

/**
 * Muestra un toast de éxito
 * @param {string} title - Título del toast
 */
export function showSuccessToast(title) {
  if (Swal) {
    Swal.fire({
      toast: true,
      position: "top",
      icon: "success",
      title,
      showConfirmButton: false,
      timer: 1500,
    });
  }
}

/**
 * Muestra un toast de nueva transacción (para panel)
 * @param {Object} datos - Datos de la transacción
 */
export function showNewTransactionToast(datos) {
  if (Swal) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      iconColor: "#25D366",
      title: "¡NUEVA TRANSACCIÓN!",
      html: `
        <div style="text-align: left; font-size: 0.9rem;">
          Enviado por: <b>${datos.sender_name || ""}</b><br>
          Monto: <span style="color: #166534; font-weight: bold;">$${datos.usd_amount || 0} USD</span>
        </div>
      `,
      showConfirmButton: false,
      timer: 10000,
      timerProgressBar: true,
      background: document.body.classList.contains("dark")
        ? "#1e293b"
        : "#ffffff",
      color: document.body.classList.contains("dark") ? "#f1f5f9" : "#1e293b",
      didOpen: (toast) => {
        toast.parentElement.style.zIndex = "10000";
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });
  }
}

/**
 * Muestra un modal de imagen (para comprobantes)
 * @param {string} imageUrl - URL de la imagen
 * @param {string} imageAlt - Texto alternativo
 */
export function showImageModal(imageUrl, imageAlt = "Imagen") {
  if (Swal) {
    Swal.fire({
      imageUrl,
      imageAlt,
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
