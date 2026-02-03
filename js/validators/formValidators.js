/**
 * Validadores reutilizables para formularios.
 * Responsabilidad única: validar valores y devolver { valid, message }.
 */

export const MAX_NOMBRE_LENGTH = 100;

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

/**
 * Nombre y apellidos: obligatorio, máx 100 caracteres.
 */
export function validateNombreApellidos(
  value,
  fieldLabel = "Nombre y apellidos",
) {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) {
    return { valid: false, message: `${fieldLabel} es obligatorio.` };
  }
  if (v.length > MAX_NOMBRE_LENGTH) {
    return {
      valid: false,
      message: `${fieldLabel} no puede superar los ${MAX_NOMBRE_LENGTH} caracteres.`,
    };
  }
  return { valid: true };
}

/**
 * WhatsApp: solo números Cuba (+53 + 8 dígitos) o EE.UU. (+1 + 10 dígitos).
 */
export function validateWhatsAppCubaOrUS(value) {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) {
    return { valid: false, message: "El número de WhatsApp es obligatorio." };
  }
  const digits = v.replace(/\D/g, "");
  // Cuba: 53 + 8 dígitos = 10 dígitos total, o solo 8 digitos
  if (
    /^53\d{8}$/.test(digits) ||
    /^5\d{7}$/.test(digits) ||
    /^63\d{6}$/.test(digits)
  ) {
    return { valid: true };
  }
  // EE.UU.: 1 + 10 dígitos = 11, o solo 10 dígitos (sin código país)
  if (/^1\d{10}$/.test(digits) || /^\d{10}$/.test(digits)) {
    return { valid: true };
  }
  return {
    valid: false,
    message:
      "Solo se permiten números de WhatsApp de Cuba (+53) o de Estados Unidos (+1). Ej: +53 5 123 4567 o +1 234 567 8901",
  };
}

/**
 * Archivo: solo imágenes (por tipo MIME y extensión).
 */
export function validateSoloImagen(file) {
  if (!file) {
    return {
      valid: false,
      message: "Debes subir la foto de la transferencia.",
    };
  }
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  const isImageType =
    IMAGE_TYPES.some((t) => type === t) || type.startsWith("image/");
  const hasImageExt = IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!isImageType && !hasImageExt) {
    return {
      valid: false,
      message: "Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP).",
    };
  }
  return { valid: true };
}

/**
 * Cuenta Zelle en formato número EE.UU.: +1 y 10 dígitos, o 10 dígitos.
 * (Para el panel admin: campo Zelle solo número US.)
 */
export function validateZelleUS(value) {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) {
    return { valid: false, message: "La cuenta Zelle es obligatoria." };
  }
  const digits = v.replace(/\D/g, "");
  if (/^1\d{10}$/.test(digits) || /^\d{10}$/.test(digits)) {
    return { valid: true };
  }
  return {
    valid: false,
    message:
      "La cuenta Zelle debe ser un número de Estados Unidos. Ej: +1 234 567 8901 o 2345678901",
  };
}

/**
 * Valida todos los campos del formulario de transferencia (para envío final).
 * Devuelve { valid: true } o { valid: false, message }.
 */
export function validateTransferForm(formData, proofFile) {
  const {
    sender_name,
    sender_whatsapp,
    recipient_name,
    recipient_whatsapp,
    recipient_province,
    recipient_municipality,
    usd_amount,
    recipient_street,
    recipient_house_number,
    recipient_neighborhood,
  } = formData || {};

  const r1 = validateNombreApellidos(sender_name, "Nombre del remitente");
  if (!r1.valid) return r1;

  const r2 = validateWhatsAppCubaOrUS(sender_whatsapp);
  if (!r2.valid) return r2;

  const r3 = validateNombreApellidos(recipient_name, "Nombre del destinatario");
  if (!r3.valid) return r3;

  const r4 = validateWhatsAppCubaOrUS(recipient_whatsapp);
  if (!r4.valid) return r4;

  if (!recipient_province?.trim()) {
    return { valid: false, message: "La provincia es obligatoria." };
  }
  if (!recipient_municipality?.trim()) {
    return { valid: false, message: "El municipio es obligatorio." };
  }

  if (!recipient_street?.trim()) {
    return {
      valid: false,
      message: "La calle del destinatario es obligatoria.",
    };
  }
  if (!recipient_house_number?.trim()) {
    return {
      valid: false,
      message: "El número de casa/apartamento del destinatario es obligatorio.",
    };
  }
  if (!recipient_neighborhood?.trim()) {
    return {
      valid: false,
      message: "El reparto/barrio del destinatario es obligatorio.",
    };
  }

  const monto = parseFloat(usd_amount);
  if (isNaN(monto) || monto < 50) {
    return {
      valid: false,
      message: "El monto mínimo permitido es de $50 USD.",
    };
  }

  const r5 = validateSoloImagen(proofFile);
  if (!r5.valid) return r5;

  return { valid: true };
}
