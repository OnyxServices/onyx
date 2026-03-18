/** Loader: barra de progreso y tips durante la carga inicial */

export function actualizarLoader(progreso, mensaje) {
  const bar = document.getElementById("main-progress-bar");
  const percentText = document.getElementById("progress-percent");
  const statusText = document.getElementById("loader-status-text");

  if (bar) bar.style.width = `${progreso}%`;
  if (percentText) percentText.innerText = `${progreso}%`;
  if (statusText && mensaje) statusText.innerText = mensaje;
}

export function rotarTips() {
  const tips = document.querySelectorAll(".tip-item");
  if (!tips.length) return null;
  let currentTip = 0;
  tips[currentTip].classList.add("active");

  return setInterval(() => {
    tips[currentTip].classList.remove("active");
    currentTip = (currentTip + 1) % tips.length;
    tips[currentTip].classList.add("active");
  }, 2500);
}
