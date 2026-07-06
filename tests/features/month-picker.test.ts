import { describe, expect, it, vi } from "vitest";
import { openNativeMonthPicker } from "../../src/features/history/monthPicker";

describe("openNativeMonthPicker", () => {
  it("does nothing when there is no input element", () => {
    expect(() => openNativeMonthPicker(null)).not.toThrow();
  });

  it("opens the native picker when the browser supports showPicker", () => {
    const input = document.createElement("input");
    const showPicker = vi.fn();
    // jsdom has no showPicker; attach one to exercise the supported path.
    (input as HTMLInputElement & { showPicker: () => void }).showPicker =
      showPicker;
    const focus = vi.spyOn(input, "focus");

    openNativeMonthPicker(input);

    expect(showPicker).toHaveBeenCalledOnce();
    expect(focus).not.toHaveBeenCalled();
  });

  it("focuses the field when showPicker throws (e.g. Firefox month input)", () => {
    const input = document.createElement("input");
    (input as HTMLInputElement & { showPicker: () => void }).showPicker =
      () => {
        throw new Error("not supported");
      };
    const focus = vi.spyOn(input, "focus");

    openNativeMonthPicker(input);

    expect(focus).toHaveBeenCalledOnce();
  });
});
