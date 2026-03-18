/** Custom select: crear y resetear */

export function createCustomSelect(
  rootEl,
  { placeholder, options, onChange, disabled = false },
) {
  if (!rootEl) return null;

  rootEl.classList.add("custom-select");
  if (disabled) rootEl.classList.add("disabled");

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "custom-select-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  if (disabled) trigger.disabled = true;

  const labelSpan = document.createElement("span");
  labelSpan.className = "custom-select-label custom-select-placeholder";
  labelSpan.textContent = placeholder;

  const arrowSpan = document.createElement("span");
  arrowSpan.className = "custom-select-arrow";
  arrowSpan.textContent = "▾";

  trigger.appendChild(labelSpan);
  trigger.appendChild(arrowSpan);

  const menu = document.createElement("div");
  menu.className = "custom-select-menu";
  menu.setAttribute("role", "listbox");

  rootEl.innerHTML = "";
  rootEl.appendChild(trigger);
  rootEl.appendChild(menu);

  let currentValue = "";

  function renderOptions(opts) {
    menu.innerHTML = "";
    (opts || []).forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "custom-select-option";
      btn.textContent = opt.label;
      btn.dataset.value = opt.value;
      btn.setAttribute("role", "option");

      if (opt.value === currentValue) {
        btn.classList.add("is-selected");
      }

      btn.addEventListener("click", () => {
        if (disabled) return;
        currentValue = opt.value;
        labelSpan.textContent = opt.label;
        labelSpan.classList.remove("custom-select-placeholder");
        rootEl.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
        if (typeof onChange === "function") onChange(currentValue);
        menu
          .querySelectorAll(".custom-select-option")
          .forEach((el) => el.classList.remove("is-selected"));
        btn.classList.add("is-selected");
      });

      menu.appendChild(btn);
    });
  }

  function setOptions(opts) {
    currentValue = "";
    labelSpan.textContent = placeholder;
    labelSpan.classList.add("custom-select-placeholder");
    renderOptions(opts);
  }

  function setDisabled(isDisabled) {
    disabled = isDisabled;
    if (isDisabled) {
      rootEl.classList.add("disabled");
      trigger.disabled = true;
      rootEl.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    } else {
      rootEl.classList.remove("disabled");
      trigger.disabled = false;
    }
  }

  renderOptions(options || []);

  trigger.addEventListener("click", () => {
    if (disabled) return;
    const isOpen = rootEl.classList.contains("open");
    document
      .querySelectorAll(".custom-select.open")
      .forEach((el) => el.classList.remove("open"));
    if (!isOpen) {
      rootEl.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
    } else {
      rootEl.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("click", (evt) => {
    if (!rootEl.contains(evt.target)) {
      rootEl.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    }
  });

  return { setOptions, setDisabled };
}

export function resetCustomSelects() {
  const roots = document.querySelectorAll(".custom-select");
  roots.forEach((root) => {
    const placeholder =
      root.dataset.placeholder ||
      root.getAttribute("data-placeholder") ||
      "Seleccione";
    const label = root.querySelector(".custom-select-label");
    if (label) {
      label.textContent = placeholder;
      label.classList.add("custom-select-placeholder");
    }
    root.querySelectorAll(".custom-select-option").forEach((opt) => {
      opt.classList.remove("is-selected");
    });
    root.classList.remove("open");
    root.classList.remove("disabled");
    const trigger = root.querySelector(".custom-select-trigger");
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
      trigger.disabled = false;
    }
  });

  const provHidden = document.getElementById("recipient-province");
  const munHidden = document.getElementById("recipient-municipality");
  if (provHidden) provHidden.value = "";
  if (munHidden) munHidden.value = "";
}
