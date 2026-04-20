import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "../../src/app/App";
import { renderWithAppState } from "../support/app";

describe("App shell", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/settings");
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("derives the active screen title and primary navigation from the current path", () => {
    renderWithAppState(<App />);

    expect(
      screen.getByText(/^settings$/i, { selector: ".app-header__title" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /primary navigation/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^today$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^history$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^settings$/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("navigates between screens through the app shell links", () => {
    renderWithAppState(<App />);

    fireEvent.click(screen.getByRole("link", { name: /^history$/i }));

    expect(
      screen.getByText(/^history$/i, { selector: ".app-header__title" }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/history");
    expect(screen.getByRole("link", { name: /^history$/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
