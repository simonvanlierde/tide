import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// jsdom defines <dialog> modal methods but makes them throw, so replace them
// with the open/close behavior the real elements provide for components under
// test. Assigned unconditionally since the jsdom stubs exist but don't work.
HTMLDialogElement.prototype.showModal = function showModal() {
  this.open = true;
};
HTMLDialogElement.prototype.close = function close() {
  this.open = false;
  this.dispatchEvent(new Event("close"));
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => {
  window.localStorage.clear();
});
