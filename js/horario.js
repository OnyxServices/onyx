function actualizarEstadoHorario() {
  const ahora = new Date();
  
  // --- CONFIGURACIÓN DE HORARIO ---
  // Puedes cambiar estos valores (Formato 24 horas)
  const horaApertura = 8;  // 8:00 AM
  const horaCierre = 18;   // 4:00 PM
  // --------------------------------
  
  const horaActual = ahora.getHours();
  const elementoStatus = document.getElementById('business-status');
  const textoStatus = document.getElementById('status-text');
  
  // Verificamos si la hora actual está dentro del rango
  const estaAbierto = horaActual >= horaApertura && horaActual < horaCierre;
  
  if (estaAbierto) {
    elementoStatus.classList.remove('status-is-closed');
    elementoStatus.classList.add('status-is-open');
    textoStatus.innerText = 'Abierto ahora';
  } else {
    elementoStatus.classList.remove('status-is-open');
    elementoStatus.classList.add('status-is-closed');
    textoStatus.innerText = 'Cerrado temporalmente';
  }
}