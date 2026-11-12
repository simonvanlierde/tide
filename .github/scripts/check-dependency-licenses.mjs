// biome-ignore lint/correctness/noNodejsModules: this check runs in Node, outside the browser.
import { readFileSync } from "node:fs";

// New or unknown licence expressions need review before they ship in the browser.
const allowed = new Set([
  "MIT",
  "ISC",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "0BSD",
  "Unlicense",
  "MIT-0",
  "BlueOak-1.0.0",
  "CC0-1.0",
  "(MIT OR CC0-1.0)",
  "MIT OR Apache-2.0",
]);
// These test engines, native build tools and browser-support data do not ship in Tide.
const toolLicenses = new Map([
  ["@axe-core/playwright", "MPL-2.0"],
  ["axe-core", "MPL-2.0"],
  ["lightningcss", "MPL-2.0"],
  ["lightningcss-linux-x64-gnu", "MPL-2.0"],
  ["@img/sharp-libvips-linux-x64", "LGPL-3.0-or-later"],
  ["caniuse-lite", "CC-BY-4.0"],
]);
const licenses = JSON.parse(readFileSync(0, "utf8"));
if (!licenses || Array.isArray(licenses) || typeof licenses !== "object" || !Object.keys(licenses).length) {
  throw new Error("No dependency licences found");
}
for (const [license, packages] of Object.entries(licenses)) {
  const unreviewed = packages.filter((pkg) => !allowed.has(license) && toolLicenses.get(pkg.name) !== license);
  if (unreviewed.length) {
    throw new Error(`Review dependency licence ${license}: ${unreviewed.map((pkg) => pkg.name).join(", ")}`);
  }
}
