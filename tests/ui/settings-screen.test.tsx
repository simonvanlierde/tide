import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";

describe("SettingsScreen", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows plain-language privacy copy", () => {
    render(<SettingsScreen />);
    expect(screen.getByText(/your cycle data stays on this device/i)).toBeInTheDocument();
  });

  it("shows export and import actions", () => {
    render(<SettingsScreen />);
    expect(screen.getByRole("button", { name: /export backup/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/import backup file/i)).toBeInTheDocument();
  });
});
