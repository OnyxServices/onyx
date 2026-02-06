/** Gráficos informativos del panel: día y mes */

import { supabaseClient } from "../api/client.js";

export async function cargarGraficos() {
  if (!supabaseClient) return;

  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);

  // Datos del día
  const { data: txHoy } = await supabaseClient
    .from("transacciones")
    .select("*")
    .eq("state", "approved")
    .gte("creation_date", inicioHoy.toISOString())
    .lt("creation_date", finHoy.toISOString());

  // Datos del mes
  const { data: txMes } = await supabaseClient
    .from("transacciones")
    .select("*")
    .eq("state", "approved")
    .gte("creation_date", inicioMes.toISOString())
    .lt("creation_date", finHoy.toISOString());

  const { data: config } = await supabaseClient
    .from("config")
    .select("exchange_rate")
    .single();
  const tasa = config?.exchange_rate || 24;

  // Calcular totales del día
  const totalUsdHoy = (txHoy || []).reduce(
    (sum, tx) => sum + (tx.usd_amount || 0),
    0,
  );
  const totalCupHoy = totalUsdHoy * tasa;
  const cantidadHoy = (txHoy || []).length;

  // Calcular totales del mes
  const totalUsdMes = (txMes || []).reduce(
    (sum, tx) => sum + (tx.usd_amount || 0),
    0,
  );
  const totalCupMes = totalUsdMes * tasa;
  const cantidadMes = (txMes || []).length;

  // Actualizar gráficos del día
  document.getElementById("chart-day-qty").innerText = cantidadHoy;
  document.getElementById("chart-day-usd").innerText =
    `$${totalUsdHoy.toFixed(2)}`;
  document.getElementById("chart-day-cup").innerText =
    `${totalCupHoy.toLocaleString("es-CU")} CUP`;

  // Actualizar gráficos del mes
  document.getElementById("chart-month-qty").innerText = cantidadMes;
  document.getElementById("chart-month-usd").innerText =
    `$${totalUsdMes.toFixed(2)}`;
  document.getElementById("chart-month-cup").innerText =
    `${totalCupMes.toLocaleString("es-CU")} CUP`;

  // Calcular promedio diario
  const promedioDia =
    cantidadMes > 0 ? (cantidadMes / hoy.getDate()).toFixed(1) : 0;
  document.getElementById("chart-avg-day").innerText = `${promedioDia} tx/día`;

  // Proyección de mes
  const proyeccionMes = Math.round((totalUsdMes / hoy.getDate()) * 30);
  document.getElementById("chart-projection").innerText =
    `$${proyeccionMes.toFixed(2)}`;
}
