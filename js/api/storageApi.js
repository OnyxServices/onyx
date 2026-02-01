/** API de almacenamiento (comprobantes) */

import { supabaseClient } from "./client.js";
import { BUCKET_COMPROBANTES } from "../config/constants.js";

export async function uploadComprobante(file) {
  if (!supabaseClient) {
    throw new Error("Cliente Supabase no disponible");
  }
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}.${ext}`;
  const filePath = `comprobantes/${fileName}`;

  const { error } = await supabaseClient.storage
    .from(BUCKET_COMPROBANTES)
    .upload(filePath, file);

  if (error) {
    throw new Error("Error al subir imagen: " + error.message);
  }

  const urlResp = supabaseClient.storage
    .from(BUCKET_COMPROBANTES)
    .getPublicUrl(filePath);
  const publicUrl =
    (urlResp && (urlResp.data?.publicUrl || urlResp.publicUrl)) || null;

  if (!publicUrl) {
    throw new Error(
      "No fue posible obtener la URL pública del comprobante. Revisa la configuración del bucket."
    );
  }
  return publicUrl;
}
