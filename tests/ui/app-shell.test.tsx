import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    expect(
      screen.getByRole("link", { name: /^calendar$/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^settings$/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("navigates between screens through the app shell links", async () => {
    const user = userEvent.setup();
    renderWithAppState(<App />);

    await user.click(screen.getByRole("link", { name: /^calendar$/i }));

    expect(
      screen.getByText(/^calendar$/i, { selector: ".app-header__title" }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/calendar");
    expect(screen.getByRole("link", { name: /^calendar$/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("follows browser back/forward by syncing to the popstate location", () => {
    renderWithAppState(<App />);

    window.history.replaceState(null, "", "/calendar");
    fireEvent.popState(window);

    expect(
      screen.getByText(/^calendar$/i, { selector: ".app-header__title" }),
    ).toBeInTheDocument();
  });

  it("ignores a click on the already-active screen link", async () => {
    const user = userEvent.setup();
    renderWithAppState(<App />);

    await user.click(screen.getByRole("link", { name: /^settings$/i }));

    expect(window.location.pathname).toBe("/settings");
    expect(screen.getByRole("link", { name: /^settings$/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("lets a modified click fall through to the browser instead of navigating", () => {
    renderWithAppState(<App />);

    const calendarLink = screen.getByRole("link", { name: /^calendar$/i });
    fireEvent.click(calendarLink, { metaKey: true });

    // No in-app navigation: the settings screen and path are untouched.
    expect(window.location.pathname).toBe("/settings");
    expect(
      screen.getByText(/^settings$/i, { selector: ".app-header__title" }),
    ).toBeInTheDocument();
  });
});
