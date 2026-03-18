/**
 * Cliente Supabase centralizado.
 * Importa y exporta la instancia única del cliente.
 * Reemplaza a js/api/client.js para evitar duplicación.
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../../data/constants.js";

const supabase = typeof window !== "undefined" ? window.supabase : null;

if (!supabase) {
  console.warn(
    "⚠️ Supabase library not loaded. Ensure <script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script> is in HTML before modules.",
  );
}

/**
 * Instancia única del cliente Supabase.
 */
export const supabaseClient = supabase
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Envuelve una promesa de Supabase y devuelve { data, error }.
 * Patrón consistente para manejo de errores.
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

/**
 * Verifica si Supabase está disponible.
 */
export function ensureClient() {
  if (!supabaseClient) throw new Error("Cliente Supabase no disponible");
  return supabaseClient;
}
