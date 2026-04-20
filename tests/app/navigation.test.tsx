import { describe, expect, it } from "vitest";
import { getAppScreen } from "../../src/app/navigation";

describe("app navigation", () => {
  it("resolves the known Tide screen paths", () => {
    expect(getAppScreen("/").title).toBe("Today");
    expect(getAppScreen("/history").title).toBe("History");
    expect(getAppScreen("/settings").title).toBe("Settings");
  });

  it("falls back to the home screen for unknown paths", () => {
    const screen = getAppScreen("/does-not-exist");

    expect(screen.path).toBe("/");
    expect(screen.title).toBe("Today");
  });
});
