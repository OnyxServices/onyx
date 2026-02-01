/** Cliente Supabase (sin globals). Requiere window.supabase cargado antes. */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../config/constants.js";

const supabase = typeof window !== "undefined" ? window.supabase : null;
if (!supabase) {
  console.warn("Supabase library not loaded. Load script before modules.");
}

export const supabaseClient = supabase
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Envuelve una promesa de Supabase y devuelve { data, error }.
 */
export async function ejecutarOperacion(promesa, etiqueta = "Operación") {
  try {
    const resultado = await promesa;
    if (resultado.error) {
      console.error(`🔴 Error en ${etiqueta}:`, resultado.error.message);
      return { data: null, error: resultado.error };
    }
    return { data: resultado.data, error: null };
  } catch (err) {
    console.error(`❌ Fallo crítico en ${etiqueta}:`, err);
    return { data: null, error: err };
  }
}
