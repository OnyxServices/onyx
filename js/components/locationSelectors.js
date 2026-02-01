/** Selectores de provincia y municipio (custom select) */

import { appStore } from "../store/appStore.js";
import { createCustomSelect } from "../ui/customSelect.js";

export function setupLocationSelectors(regiones) {
  if (appStore.customSelectsInitialized) return;

  const provinciaHidden = document.getElementById("recipient-province");
  const municipioHidden = document.getElementById("recipient-municipality");
  const provinciaSelect = document.getElementById("recipient-province-select");
  const municipioSelect = document.getElementById(
    "recipient-municipality-select",
  );

  if (
    !provinciaHidden ||
    !municipioHidden ||
    !provinciaSelect ||
    !municipioSelect
  ) {
    return;
  }

  const regionesCuba =
    regiones && regiones.length ? regiones : appStore.regionesCuba;
  if (!regionesCuba.length) {
    console.warn("No hay regiones cargadas para los selectores.");
    return;
  }

  const provinciaOptions = regionesCuba.map((r) => ({
    value: r.province,
    label: r.province,
  }));

  const municipioControl = createCustomSelect(municipioSelect, {
    placeholder: municipioSelect.dataset.placeholder || "Seleccione municipio",
    options: [],
    disabled: true, // Inicialmente deshabilitado
    onChange: (value) => {
      municipioHidden.value = value || "";
    },
  });

  const provinciaControl = createCustomSelect(provinciaSelect, {
    placeholder: provinciaSelect.dataset.placeholder || "Seleccione provincia",
    options: provinciaOptions,
    onChange: (value) => {
      provinciaHidden.value = value || "";
      const region = regionesCuba.find(
        (r) => r.province.toLowerCase() === (value || "").toLowerCase(),
      );
      const munOptions = region
        ? region.municipalities.map((m) => ({ value: m, label: m }))
        : [];
      municipioControl.setOptions(munOptions);
      municipioControl.setDisabled(!value); // Deshabilitar si no hay provincia
      municipioHidden.value = "";
    },
  });

  appStore.customSelectsInitialized = true;
}
