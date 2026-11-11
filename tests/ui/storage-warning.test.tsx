import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";
import { createAppState, renderWithAppState } from "../support/app";

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});

it("warns when a log cannot be saved and still exports the in-memory history", async () => {
  const user = userEvent.setup();
  renderWithAppState(<App />, { state: createAppState() });
  const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Storage is full", "QuotaExceededError");
  });
  vi.spyOn(console, "warn").mockImplementation(() => {});

  await user.click(screen.getByRole("button", { name: /log bleeding today/i }));

  expect(screen.getByRole("alert")).toHaveTextContent(/couldn't be saved.*export a backup/i);
  await user.click(screen.getByRole("link", { name: /^settings$/i }));
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const download = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:tide-backup");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  await user.click(screen.getByRole("button", { name: /^export$/i }));
  const blob = download.mock.calls[0]?.[0] as Blob;
  expect(Object.keys(JSON.parse(await blob.text()).days)).toHaveLength(1);
  expect(screen.getByRole("alert")).toBeInTheDocument();

  write.mockRestore();
  await user.click(screen.getByRole("switch", { name: /cycle day numbers/i }));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
