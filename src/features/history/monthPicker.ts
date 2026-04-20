export function supportsNativeMonthInput(doc: Document = document) {
  const input = doc.createElement("input");
  input.setAttribute("type", "month");
  return input.type === "month";
}

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
