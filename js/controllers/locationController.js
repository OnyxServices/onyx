/**
 * ORQUESTRADOR: Coordina la lógica del mapa de ubicación
 *
 * Responsabilidades:
 * - Mantener estado del mapa y marcador
 * - Manejar eventos de mapa
 * - Actualizar campos de formulario con coordenadas
 */

import { showError } from "../ui/utils/swalUtils.js";

let map = null;
let marker = null;

/**
 * Abre el modal del mapa e inicializa Leaflet
 */
export function orchestrateOpenMap() {
  const modal = document.getElementById("modalMapa");
  if (modal) {
    modal.style.display = "flex";
    orchestrateInitializeMap();
  }
}

/**
 * Cierra el modal del mapa y limpia recursos
 */
export function orchestrateCloseMap() {
  const modal = document.getElementById("modalMapa");
  if (modal) {
    modal.style.display = "none";
    if (map) {
      map.remove();
      map = null;
      marker = null;
    }
  }
}

/**
 * Inicializa el mapa con Leaflet
 */
function orchestrateInitializeMap() {
  // Coordenadas iniciales de Cuba
  const cubaLat = 21.521757;
  const cubaLng = -77.781167;
  const zoom = 6;

  map = L.map("map").setView([cubaLat, cubaLng], zoom);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Agregar marcador inicial si ya hay coordenadas
  const latInput = document.getElementById("recipient-latitude");
  const lngInput = document.getElementById("recipient-longitude");
  if (latInput?.value && lngInput?.value) {
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    marker = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], 15);
  }

  // Evento para colocar marcador al hacer clic
  map.on("click", function (e) {
    if (marker) {
      map.removeLayer(marker);
    }
    marker = L.marker(e.latlng).addTo(map);
  });
}

/**
 * Orquesta la confirmación de ubicación
 */
export function orchestrateConfirmLocation() {
  if (!marker) {
    showError(
      "Selecciona una ubicación",
      "Haz clic en el mapa para seleccionar la ubicación del destinatario.",
    );
    return;
  }

  const latlng = marker.getLatLng();
  const latInput = document.getElementById("recipient-latitude");
  const lngInput = document.getElementById("recipient-longitude");

  if (latInput) latInput.value = latlng.lat;
  if (lngInput) lngInput.value = latlng.lng;

  const display = document.getElementById("location-display");
  if (display) {
    display.innerText = `Ubicación seleccionada: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
  }

  orchestrateCloseMap();
}
