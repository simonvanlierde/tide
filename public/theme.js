// Apply the saved theme before first paint so there is no flash. index.html
// loads this as a classic (blocking) script; the provider keeps
// <html data-theme> in sync afterwards. It is a file, not an inline script, so
// the Content-Security-Policy can stay at script-src 'self'.
(() => {
  let theme = "system";
  try {
    // STORAGE_KEY in src/data/schema.ts; tests/data/theme-script.test.ts
    // fails if the two drift apart.
    const raw = localStorage.getItem("tide.period-tracker.state");
    const parsed = raw ? JSON.parse(raw) : null;
    // Unwrap the legacy { version, state } envelope the same way
    // normalizeAppState does, so migrated users don't flash the wrong theme.
    const settings = parsed && (parsed.state?.settings ?? parsed.settings);
    theme = settings?.theme ?? "system";
  } catch {
    /* Storage blocked or unreadable: follow the OS below. */
  }
  const dark = theme === "dark" || (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  // The only pre-paint copy of the ground colours; the provider reads
  // them from the --bg-top token once styles are in.
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0e1a1e" : "#f5f9f9");
})();
