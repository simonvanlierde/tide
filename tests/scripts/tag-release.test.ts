// biome-ignore lint/correctness/noNodejsModules: the release-script regression runs in the test runner's Node process.
import { execFileSync } from "node:child_process";
import { expect, it } from "vitest";

it("refuses to tag a release with a different manifest version", () => {
  expect(execFileSync("bash", [".github/scripts/test-tag-release.sh"], { encoding: "utf8" })).toContain("PASS:");
});
