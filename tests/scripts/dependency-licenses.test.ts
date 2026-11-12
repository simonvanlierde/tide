// biome-ignore lint/correctness/noNodejsModules: this check runs in Node, outside the browser.
import { spawnSync } from "node:child_process";
// biome-ignore lint/correctness/noNodejsModules: this check runs in Node, outside the browser.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
// biome-ignore lint/correctness/noNodejsModules: this check runs in Node, outside the browser.
import { tmpdir } from "node:os";
// biome-ignore lint/correctness/noNodejsModules: this check runs in Node, outside the browser.
import { join } from "node:path";
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

it("rejects an unreviewed bundled development dependency through the CI inventory step", () => {
  const directory = mkdtempSync(join(tmpdir(), "tide-license-workflow-"));
  try {
    const pnpm = join(directory, "pnpm");
    writeFileSync(
      pnpm,
      `#!${process.execPath}\nprocess.stdout.write(JSON.stringify(process.argv.includes("--prod") ? {MIT: [{name: "react"}]} : {"GPL-3.0-only": [{name: "workbox-core"}]}));\n`,
      { mode: 0o755 },
    );
    const command = readFileSync(".github/workflows/dependency-licenses.yml", "utf8").split("        run: |-\n")[1];
    expect(command).toBeDefined();
    const result = spawnSync("bash", ["-e", "-c", command ?? ""], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, RUNNER_TEMP: directory },
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Review dependency licence GPL-3.0-only: workbox-core");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

it("limits build and test exceptions to the reviewed package and licence", () => {
  expect(check('{"MPL-2.0":[{"name":"axe-core"}]}').status).toBe(0);
  expect(check('{"GPL-3.0-only":[{"name":"axe-core"}]}').status).not.toBe(0);
  expect(check('{"MPL-2.0":[{"name":"workbox-core"}]}').status).not.toBe(0);
});
