export function openNativeMonthPicker(input: HTMLInputElement | null) {
  if (!input) {
    return;
  }

  if ("showPicker" in input && typeof input.showPicker === "function") {
    input.showPicker();
    return;
  }

  input.focus();
  input.click();
}
