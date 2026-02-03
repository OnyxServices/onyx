/** Indicador de estado abierto/cerrado (8am - 6pm) */

export function initializeStatusIndicator() {
  updateStatusIndicator();
  setInterval(updateStatusIndicator, 60000); // Actualizar cada minuto
}

function updateStatusIndicator() {
  const now = new Date();
  const hours = now.getHours();
  const isOpen = hours >= 8 && hours < 18; // 8am a 6pm (18:00)

  const statusEl = document.getElementById("status-text");
  const hoursEl = document.getElementById("status-hours");
  const indicator = document.getElementById("status-indicator");

  if (!statusEl || !hoursEl || !indicator) return;

  if (isOpen) {
    statusEl.innerText = "ABIERTO";
    statusEl.style.color = "#28a745";
    hoursEl.innerText = "Atendiéndote 8am - 6pm";
    indicator.style.background = "rgba(40, 167, 69, 0.15)";
    indicator.style.borderLeft = "4px solid #28a745";
  } else {
    statusEl.innerText = "CERRADO";
    statusEl.style.color = "#dc3545";
    hoursEl.innerText = "Abrimos a las 8am mañana";
    indicator.style.background = "rgba(220, 53, 69, 0.15)";
    indicator.style.borderLeft = "4px solid #dc3545";
  }
}

