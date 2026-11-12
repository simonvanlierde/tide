// biome-ignore lint/correctness/noNodejsModules: this check runs in Node, outside the browser.
import { spawnSync } from "node:child_process";
// biome-ignore lint/correctness/noNodejsModules: this check runs in Node, outside the browser.
import process from "node:process";
import { expect, it } from "vitest";

const script = ".github/scripts/check-dependency-licenses.mjs";
const check = (input: string) => spawnSync(process.execPath, [script], { input, encoding: "utf8" });

it("accepts reviewed production licences", () => {
  expect(check('{"MIT":[{"name":"react"}],"ISC":[{"name":"lucide-react"}]}').status).toBe(0);
});

it("rejects incompatible or unknown licences and names the dependency", () => {
  for (const license of ["GPL-3.0-only", "UNKNOWN"]) {
    const result = check(JSON.stringify({ [license]: [{ name: "example-package" }] }));
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`Review dependency licence ${license}: example-package`);
  }
});

it("fails closed on absent or malformed inventory", () => {
  for (const input of ["{}", "[]", "null", "not json"]) expect(check(input).status).not.toBe(0);
});
