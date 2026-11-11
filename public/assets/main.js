const dialog = document.querySelector(".art-dialog");
const openArt = document.querySelector("[data-open-art]");

if (dialog && openArt && typeof dialog.showModal === "function") {
  openArt.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    dialog.showModal();
    document.body.classList.add("dialog-open");
  });

  dialog
    .querySelector("[data-close-art]")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    openArt.focus({ preventScroll: true });
  });
}

const themeToggle = document.querySelector("[data-reading-theme-toggle]");

if (themeToggle) {
  const storageKey = "santis-book-reading-theme";
  const root = document.documentElement;

  const readStoredTheme = () => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  const writeStoredTheme = (value) => {
    try {
      window.localStorage.setItem(storageKey, value);
    } catch {
      // Storage unavailable; keep working in-memory during this visit.
    }
  };

  const applyTheme = (theme) => {
    const isNight = theme === "night";
    if (isNight) {
      root.setAttribute("data-reading-theme", "night");
    } else {
      root.removeAttribute("data-reading-theme");
    }
    themeToggle.setAttribute("aria-pressed", String(isNight));
  };

  const initialTheme =
    root.getAttribute("data-reading-theme") === "night" ||
    readStoredTheme() === "night"
      ? "night"
      : "light";
  applyTheme(initialTheme);

  themeToggle.addEventListener("click", () => {
    const nextTheme =
      root.getAttribute("data-reading-theme") === "night" ? "light" : "night";
    applyTheme(nextTheme);
    writeStoredTheme(nextTheme);
  });

  window.addEventListener("pageshow", () => {
    const stored = readStoredTheme();
    if (stored === "night" || stored === "light") {
      applyTheme(stored);
    }
  });
}
