/** Servicio: centraliza suscripciones realtime a Supabase */

import { subscribeToInserts, unsubscribe } from "../api/realtimeApi.js";

export function subscribeToTransactionInserts(callback) {
  return subscribeToInserts("transacciones", callback);
}

export function unsubscribeFromRealtime(channel) {
  unsubscribe(channel);
}
