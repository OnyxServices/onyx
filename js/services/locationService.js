/** Servicio de gestión de ubicaciones (provincias y municipios) */

import { appStore } from "../store/appStore.js";

export function getRegiones() {
  return appStore.regionesCuba || [];
}

export function getProvinciaOptions(regiones) {
  const regionesCuba = regiones && regiones.length ? regiones : getRegiones();
  
  if (!regionesCuba.length) {
    console.warn("No hay regiones cargadas para los selectores.");
    return [];
  }

  return regionesCuba.map((r) => ({
    value: r.province,
    label: r.province,
  }));
}

export function getMunicipiosForProvincia(provincia, regiones) {
  const regionesCuba = regiones && regiones.length ? regiones : getRegiones();
  
  const region = regionesCuba.find(
    (r) => r.province.toLowerCase() === (provincia || "").toLowerCase(),
  );

  return region
    ? region.municipalities.map((m) => ({ value: m, label: m }))
    : [];
}