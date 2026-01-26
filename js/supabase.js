// js/supabase.js

const SUPABASE_URL = "https://pwbemdkqgdufxicztpwv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3YmVtZGtxZ2R1ZnhpY3p0cHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDA2NjUsImV4cCI6MjA4NDkxNjY2NX0.FVa2QSJVbHZVIDJSbqawSJexxOt8drvJubXXv8840HM";

// Inicializamos el cliente. 
// Usamos 'supabaseClient' para no confundirlo con la librería global 'supabase'
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Función robusta para envolver peticiones y manejar errores
 * Devuelve { data, error }
 */
async function ejecutarOperacion(promesa, etiqueta = "Operación") {
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

// --- BORRADO MASIVO DE TRANSACCIONES + COMPROBANTES ---
async function borrarTodoTransacciones(bucketName = "comprobantes") {
    if (!confirm("⚠️ Esto eliminará TODAS las transacciones y comprobantes. Continuar?")) return;

    // 1️⃣ Obtener todas las transacciones con comprobante_url
    const { data: txs, error: errorTx } = await ejecutarOperacion(
        supabaseClient.from('transacciones').select('id, comprobante_url'),
        "Obtener transacciones"
    );
    if (errorTx) return Swal.fire("Error", errorTx.message, "error");

    // 2️⃣ Borrar todos los comprobantes del bucket
    if (txs.length > 0) {
        for (let tx of txs) {
            if (tx.comprobante_url) {
                try {
                    const path = decodeURIComponent(tx.comprobante_url.split(`/o/`)[1].split('?')[0]);
                    const { error } = await supabaseClient.storage.from(bucketName).remove([path]);
                    if (error) console.error("Error borrando archivo:", tx.comprobante_url, error);
                } catch (err) {
                    console.error("Error procesando URL:", tx.comprobante_url, err);
                }
            }
        }
    }

    // 3️⃣ Borrar todas las transacciones
    const { error: errorDelete } = await ejecutarOperacion(
        supabaseClient.from('transacciones').delete().neq('id', 0),
        "Borrar transacciones"
    );
    if (errorDelete) return Swal.fire("Error", errorDelete.message, "error");

    // 4️⃣ Borrar logs relacionados
    const { error: errorLogs } = await ejecutarOperacion(
        supabaseClient.from('logs_operacion').delete().neq('id', 0),
        "Borrar logs"
    );
    if (errorLogs) console.error("Error borrando logs:", errorLogs);

    Swal.fire("Éxito", "Todas las transacciones y comprobantes han sido eliminados", "success");
}

// Verificar conexión al cargar
(async () => {
    const { error } = await supabaseClient.from('config').select('id').limit(1).single();
    if (error) console.warn("⚠️ Conexión establecida pero con advertencia (RLS):", error.message);
    else console.log("✅ Conexión con Supabase lista.");
})();