import { describe, expect, it } from "vitest";
import { getAppScreen } from "../../src/app/navigation";

describe("app navigation", () => {
  it("resolves the known Tide screen paths", () => {
    expect(getAppScreen("/").labelKey).toBe("nav.today");
    expect(getAppScreen("/calendar").labelKey).toBe("nav.calendar");
    expect(getAppScreen("/settings").labelKey).toBe("nav.settings");
  });

  it("falls back to the home screen for unknown paths", () => {
    const screen = getAppScreen("/does-not-exist");

    expect(screen.path).toBe("/");
    expect(screen.labelKey).toBe("nav.today");
  });

  it("builds an element for each screen's render()", () => {
    for (const path of ["/", "/calendar", "/settings"]) {
      expect(getAppScreen(path).render()).toBeTruthy();
    }
  });
});
