/** API de almacenamiento (comprobantes) */

import { supabaseClient, ensureClient } from "./supabaseClient.js";
import { BUCKET_COMPROBANTES } from "../../data/constants.js";

export async function uploadProof(file) {
  ensureClient();
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}.${ext}`;
  const filePath = `proof/${fileName}`;

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
      "No fue posible obtener la URL pública del comprobante. Revisa la configuración del bucket.",
    );
  }
  return publicUrl;
}
