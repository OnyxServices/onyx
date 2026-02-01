/** Tema (modo oscuro) del panel */

export function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("dark-mode", isDark);
  const btn = document.getElementById("dark-mode-btn");
  if (btn) btn.innerText = isDark ? "☀️" : "🌙";
}

export function applySavedTheme() {
  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark");
    const btn = document.getElementById("dark-mode-btn");
    if (btn) btn.innerText = "☀️";
  }
}
