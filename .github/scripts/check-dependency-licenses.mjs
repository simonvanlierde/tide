// biome-ignore lint/correctness/noNodejsModules: this check runs in Node, outside the browser.
import { readFileSync } from "node:fs";

// New or unknown licence expressions need review before they ship in the browser.
const allowed = new Set(["MIT", "ISC", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "0BSD", "Unlicense"]);
const licenses = JSON.parse(readFileSync(0, "utf8"));
if (!licenses || Array.isArray(licenses) || typeof licenses !== "object" || !Object.keys(licenses).length) {
  throw new Error("No dependency licences found");
}
for (const [license, packages] of Object.entries(licenses)) {
  if (!allowed.has(license)) {
    throw new Error(`Review dependency licence ${license}: ${packages.map((pkg) => pkg.name).join(", ")}`);
  }
}
