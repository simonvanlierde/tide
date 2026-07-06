export function openNativeMonthPicker(input: HTMLInputElement | null) {
  if (!input) {
    return;
  }

  try {
    if ("showPicker" in input && typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
  } catch {
    // Browsers without native month support (e.g. Firefox) render a text field
    // and throw here; fall through to focusing it so it can be typed as YYYY-MM.
  }

  input.focus();
}
