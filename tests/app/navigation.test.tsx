import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { followAppLink } from "../../src/app/links";
import { getAppScreen } from "../../src/app/navigation";

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("app navigation", () => {
  it("retains a same-app link's query and fragment", () => {
    render(
      // biome-ignore lint/a11y/useValidAnchor: tests real page links handled without a reload
      <a href="/settings?from=today#import" onClick={followAppLink}>
        Import
      </a>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Import" }));
    expect(window.location.pathname).toBe("/settings");
    expect(window.location.search).toBe("?from=today");
    expect(window.location.hash).toBe("#import");
  });

  it("leaves an already-prevented link alone", () => {
    window.history.replaceState(null, "", "/calendar");
    render(
      // biome-ignore lint/a11y/useValidAnchor: tests real page links handled without a reload
      <a
        href="/settings#import"
        onClick={(event) => {
          event.preventDefault();
          followAppLink(event);
        }}
      >
        Import
      </a>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Import" }));
    expect(window.location.pathname).toBe("/calendar");
    expect(window.location.hash).toBe("");
  });

  it.each([
    ["middle", { button: 1 }],
    ["ctrl", { ctrlKey: true }],
    ["shift", { shiftKey: true }],
    ["alt", { altKey: true }],
  ])("leaves a %s click to the browser", (_name, init) => {
    window.history.replaceState(null, "", "/calendar");
    render(
      // biome-ignore lint/a11y/useValidAnchor: tests real page links handled without a reload
      <a href="/settings" onClick={followAppLink}>
        Settings
      </a>,
    );
    const link = screen.getByRole("link", { name: "Settings" });
    expect(fireEvent.click(link, init)).toBe(true);
    expect(window.location.pathname).toBe("/calendar");
  });

  it("resolves the known Tide screen paths", () => {
    expect(getAppScreen("/").labelKey).toBe("nav.today");
    expect(getAppScreen("/calendar").labelKey).toBe("nav.calendar");
    expect(getAppScreen("/settings").labelKey).toBe("nav.settings");
  });

  it("falls back to the home screen for unknown paths", () => {
    const resolved = getAppScreen("/does-not-exist");

    expect(resolved.path).toBe("/");
    expect(resolved.labelKey).toBe("nav.today");
  });

  it("builds an element for each screen's render()", () => {
    for (const path of ["/", "/calendar", "/settings"]) {
      expect(getAppScreen(path).render()).toBeTruthy();
    }
  });
});
