// Compare compiled catalogs with the dictionaries from the last main before migration.
// Run `pnpm lingui compile --strict` first, then `node scripts/compareI18n.mjs [base-ref]`.
// biome-ignore-all lint/suspicious/noMisplacedAssertion: Standalone comparison uses Node assertions outside a test runner.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { stripTypeScriptTypes } from "node:module";
import process from "node:process";
import { setupI18n } from "@lingui/core";

const root = new URL("../", import.meta.url);
const base = process.argv[2] ?? "f8483df";
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trimEnd();
const commit = git("rev-parse", "--verify", `${base}^{commit}`);
const locales = ["en", "nl", "de", "fr", "es"];
const counts = [0, 1, 2, 5, 21, 101, 1_000_000, 1.5, -1, -2, -1.5];
const placeholder = /\{(\w+)\}/g;
const pluralSuffix = /\.(one|other)$/;

function baseline(path) {
  const source = git("show", `${commit}:${path}`);
  return import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString("base64")}`);
}

function variables(template, locale, n) {
  const examples = {
    n,
    count: n,
    spread: n.toLocaleString(locale),
    day: 12,
    cycle: 28,
    median: (27.5).toLocaleString(locale),
    max: 31,
    min: 2,
    gap: 14,
    recent: 6,
    luteal: 14,
    before: 5,
    after: 1,
    date: "12 nov. 2026",
    start: "15 oct. 2026",
    from: "10 nov. 2026",
    to: "14 nov. 2026",
    list: "27, 28, 29",
    version: "0.5.0",
  };
  return Object.fromEntries(
    [...template.matchAll(placeholder)].map(([, name]) => [name, examples[name] ?? `sample '${name}' # {value}`]),
  );
}

const { EXPLAIN_MESSAGES } = await baseline("src/features/today/explainMessages.ts");
const catalogs = await Promise.all(
  locales.map(async (locale) => {
    const [old, main, explain] = await Promise.all([
      baseline(`src/i18n/${locale}.ts`),
      import(new URL(`src/i18n/locales/${locale}.mjs`, root)),
      import(new URL(`src/features/today/locales/${locale}.mjs`, root)),
    ]);
    return [
      locale,
      [
        ["main", old[locale], main.messages],
        ["explainer", EXPLAIN_MESSAGES[locale], explain.messages],
      ],
    ];
  }),
);
let total = 0;
console.log(`Baseline: ${commit}`);
console.log(`Plural inputs: ${counts.join(", ")}`);
for (const [locale, entries] of catalogs) {
  let renders = 0;
  let oldKeys = 0;
  const mappings = [];
  for (const [directory, old, messages] of entries) {
    const ids = [...new Set(Object.keys(old).map((id) => id.replace(pluralSuffix, "")))].sort();
    assert.deepEqual(Object.keys(messages).sort(), ids, `${locale}: ${directory} message IDs`);
    const i18n = setupI18n({ locale, messages: { [locale]: messages } });
    const visited = new Set();
    for (const id of ids) {
      const isPlural = `${id}.one` in old;
      if (isPlural) mappings.push(`${id}.{one,other} → ${id}`);
      for (const n of isPlural ? counts : [2]) {
        const category = new Intl.PluralRules(locale).select(n) === "one" ? "one" : "other";
        const oldId = isPlural ? `${id}.${category}` : id;
        const template = old[oldId];
        assert.equal(typeof template, "string", `${locale}: missing baseline ${oldId}`);
        const vars = variables(template, locale, n);
        if (isPlural) vars[id === "explain.range" ? "count" : "n"] = n;
        const expected = template.replace(placeholder, (_, name) => String(vars[name]));
        assert.equal(i18n._(id, vars), expected, `${locale}: ${oldId} → ${id}, n=${n}`);
        visited.add(oldId);
        renders++;
      }
    }
    assert.deepEqual([...visited].sort(), Object.keys(old).sort(), `${locale}: every baseline key/form rendered`);
    oldKeys += visited.size;
  }
  total += renders;
  console.log(
    `${locale}: ${oldKeys} baseline keys/forms, ${oldKeys - mappings.length} catalog IDs, ${renders} renders OK`,
  );
  console.log(`  Mapped IDs: ${mappings.join("; ")}`);
}
console.log(`PASS: ${total} exact render comparisons across ${locales.length} locales; no missing or added IDs.`);
