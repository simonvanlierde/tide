import { describe, expect, it } from "vitest";
import changelog from "../../CHANGELOG.md?raw";
import { version } from "../../package.json";

describe("release version", () => {
  it("matches the latest released version in the CHANGELOG", () => {
    const latest = changelog.match(/^## \[(\d+\.\d+\.\d+)\] - \d{4}-\d{2}-\d{2}$/m);

    expect(latest?.[1]).toBe(version);
  });
});
