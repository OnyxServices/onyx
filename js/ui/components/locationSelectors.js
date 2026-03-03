/** Selectores de provincia y municipio (custom select) */

import { appStore } from "../../store/appStore.js";
import { createCustomSelect } from "../utils/customSelect.js";
import {
  getRegiones,
  getProvinciaOptions,
  getMunicipiosForProvincia,
} from "../../services/locationService.js";

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

  const regionesCuba = regiones || getRegiones();
  if (!regionesCuba.length) {
    console.warn("No hay regiones cargadas para los selectores.");
    return;
  }

  const provinciaOptions = getProvinciaOptions(regionesCuba);

  const municipioControl = createCustomSelect(municipioSelect, {
    placeholder: municipioSelect.dataset.placeholder || "Seleccione municipio",
    options: [],
    disabled: true,
    onChange: (value) => {
      municipioHidden.value = value || "";
    },
  });

  const provinciaControl = createCustomSelect(provinciaSelect, {
    placeholder: provinciaSelect.dataset.placeholder || "Seleccione provincia",
    options: provinciaOptions,
    onChange: (value) => {
      provinciaHidden.value = value || "";
      const munOptions = getMunicipiosForProvincia(value, regionesCuba);
      municipioControl.setOptions(munOptions);
      municipioControl.setDisabled(!value);
      municipioHidden.value = "";
    },
  });

  appStore.customSelectsInitialized = true;
}
