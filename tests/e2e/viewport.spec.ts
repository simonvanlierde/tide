import { expect, type Page, test } from "@playwright/test";
import { findOverflow } from "./overflow";
import { seedAppState } from "./seed";

// Widths we commit to supporting, plus one short-height case for the fixed tab
// bar. 320x568 is the hard floor (iPhone SE 1st gen); 280 is the foldable
// cover-screen edge; 360/390 are the common Android/iPhone widths; 430 is the
// largest iPhone, just under the 460px shell.
const SIZES = [
  { name: "fold cover 280x720", width: 280, height: 720 },
  { name: "small 320x568", width: 320, height: 568 },
  { name: "android 360x800", width: 360, height: 800 },
  { name: "iphone 390x844", width: 390, height: 844 },
  { name: "pro max 430x932", width: 430, height: 932 },
  { name: "short 360x500", width: 360, height: 500 },
] as const;

const ROUTES = ["/", "/calendar", "/settings"] as const;

const medium = (days: string[]) => Object.fromEntries(days.map((day) => [day, "medium"]));

async function openInsights(page: Page) {
  await page.locator(".fact-list__more").first().click();
  await page.locator(".insights__how > summary").click();
}

// Four one-day period starts, cycles of 33, 27 and 31 days: the explainer
// then shows its longest lines, a range and a widened fertile window.
const VARIED_CYCLES = medium(["2026-01-10", "2026-02-12", "2026-03-11", "2026-04-11"]);

async function openExplainer(page: Page) {
  await page.locator(".fact-list__more").nth(1).click();
  await page.getByRole("dialog").waitFor();
}

// A period that ended ten days before today, so the dial is between periods.
const PAST_PERIOD = medium(["2026-04-01", "2026-04-02", "2026-04-03", "2026-04-04"]);

// Every screen, and every sheet, dialog and popover it can open, in the states
// that change what is on it. Each must fit at every size in every language.
// The seed has fertility estimates on; the screens whose words change when
// they are off (or not answered yet) run again in that state.
const SCREENS: {
  name: string;
  path: string;
  settings?: Record<string, unknown>;
  days?: Record<string, string>;
  open?: (page: Page) => Promise<unknown>;
}[] = [
  { name: "today, logged", path: "/" },
  {
    name: "today, period late",
    path: "/",
    days: medium(["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04"]),
  },
  { name: "today, nothing logged", path: "/", days: {} },
  {
    // The dial reads "Between periods" here, two lines in German.
    name: "today, fertility question, between periods",
    path: "/",
    settings: { showFertility: null },
    days: PAST_PERIOD,
  },
  {
    name: "today scrubbed, fertility off",
    path: "/",
    settings: { showFertility: false },
    days: PAST_PERIOD,
    open: async (page) => {
      await page.locator(".cycle-dial__frame").focus();
      await page.keyboard.press("ArrowLeft");
    },
  },
  { name: "cycle insights sheet", path: "/", open: openInsights },
  {
    name: "cycle insights sheet, fertility off",
    path: "/",
    settings: { showFertility: false },
    open: openInsights,
  },
  {
    name: "forecast explainer sheet",
    path: "/",
    days: VARIED_CYCLES,
    open: openExplainer,
  },
  {
    name: "forecast explainer sheet, default cycle, fertility off",
    path: "/",
    settings: { showFertility: false },
    open: openExplainer,
  },
  { name: "calendar", path: "/calendar" },
  {
    name: "calendar, fertility off",
    path: "/calendar",
    settings: { showFertility: false },
  },
  {
    name: "calendar flow picker",
    path: "/calendar",
    open: (page) => page.locator(".calendar-grid__day.is-logged").first().click(),
  },
  {
    name: "calendar month picker",
    path: "/calendar",
    open: (page) => page.locator(".calendar__month-button").click(),
  },
  {
    name: "calendar past period",
    path: "/calendar",
    open: (page) => page.locator(".calendar__range").click(),
  },
  { name: "settings", path: "/settings" },
  {
    name: "settings delete dialog",
    path: "/settings",
    open: (page) => page.locator(".data-actions ~ .text-action").click(),
  },
  {
    name: "settings import dialog",
    path: "/settings",
    open: (page) =>
      // Picks a one-day Clue export, built in the page so no file is needed.
      page.locator('input[type="file"]').evaluate((input: HTMLInputElement) => {
        const clue = [{ date: "2026-03-01", type: "period", value: {} }];
        const files = new DataTransfer();
        files.items.add(
          new File([JSON.stringify(clue)], "measurements.json", {
            type: "application/json",
          }),
        );
        input.files = files.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }),
  },
];

// Every shipped language: German and French run longest ("Schmierblutung",
// "Exportieren"), and none of them may clip or overlap.
const LANGUAGES = ["en", "de", "fr", "nl", "es"] as const;

// Headings, labels and button words. Their words break only at a soft
// hyphen between the parts of a compound ("Fruchtbarkeits-schätzungen"),
// never at a syllable the browser picks ("an-zeigen", "FER-TI-LITÉ"). Body
// text keeps the browser's hyphenation.
const LABELS = [
  "h1",
  "h2",
  "h3",
  "button",
  "label",
  "summary",
  "legend",
  "dt",
  ".settings-label",
  ".section-title",
  ".segmented__label",
  ".status-chip",
  ".tab-item__label",
  ".insights__stat-label",
  ".insights__regularity-label",
  ".flow-gauge__label",
  ".cycle-dial__eyebrow",
  ".cycle-dial__phase",
  ".app-header__title",
].join(", ");

// Every word part (a word, or the piece of a compound between soft or hard
// hyphens)
// in the matching elements whose first and last letters sit on different
// lines. Letters, not the whole part: Chromium hands a soft hyphen's rendered
// "-" to the letter after it, so a clean break at the hyphen would look split.
// Screen-reader-only text and the info button's hidden text are left out.
function splitWordParts(page: Page, selector: string) {
  return page.locator(selector).evaluateAll((labels) => {
    const nodes = new Set<Node>();
    for (const label of labels) {
      const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.parentElement?.closest(".info-popover, .visually-hidden")) {
          nodes.add(node);
        }
      }
    }
    const lineOf = (node: Node, offset: number) => {
      const range = document.createRange();
      range.setStart(node, offset);
      range.setEnd(node, offset + 1);
      return [...range.getClientRects()].at(-1)?.top;
    };
    const split: string[] = [];
    for (const node of nodes) {
      for (const part of (node.textContent ?? "").matchAll(/[^\s\u00ad-]+/g)) {
        const last = part.index + part[0].length - 1;
        if (lineOf(node, part.index) !== lineOf(node, last)) {
          split.push(part[0]);
        }
      }
    }
    return split;
  });
}

for (const size of SIZES) {
  for (const language of LANGUAGES) {
    test.describe(`${size.name} ${language} overflow`, () => {
      test.use({ viewport: { width: size.width, height: size.height } });

      // The document can fit while a word spills out of its own box: a flow
      // label running into its neighbour, or a clipped button.
      for (const screen of SCREENS) {
        test(`${screen.name} fits every element in its box and the viewport, words whole`, async ({ page }) => {
          await seedAppState(page, language, screen.settings, screen.days);
          await page.goto(screen.path);
          await expect(page.locator(".tab-bar")).toBeVisible();
          await screen.open?.(page);
          const overflowing = await findOverflow(page);
          const splitWords = await splitWordParts(page, LABELS);

          // Opening one info popover closes the others, so check each in turn.
          if (!screen.open) {
            const triggers = page.locator("#main .info-popover__trigger");
            for (let i = 0; i < (await triggers.count()); i++) {
              await triggers.nth(i).click();
              for (const found of await findOverflow(page)) {
                overflowing.push(`info popover ${i + 1}: ${found}`);
              }
              await page.keyboard.press("Escape");
            }
          }

          expect(overflowing).toEqual([]);
          expect(splitWords).toEqual([]);
        });
      }
    });
  }
}

for (const size of SIZES) {
  for (const language of LANGUAGES) {
    test.describe(`${size.name} ${language}`, () => {
      test.use({ viewport: { width: size.width, height: size.height } });

      test.beforeEach(async ({ page }) => {
        await seedAppState(page, language);
      });

      for (const path of ROUTES) {
        test(`${path} keeps interactive content clear of the tab bar`, async ({ page }) => {
          await page.goto(path);
          await expect(page.locator(".tab-bar")).toBeVisible();

          // Scroll to the very bottom, then check that nothing you can click in
          // <main> is left hidden behind the fixed tab bar (the padding under
          // .app-main must clear it). Measured lowest-first, not DOM order.
          const { maxBottom, tabTop } = await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
            const interactive = document.querySelectorAll(
              "#main a, #main button, #main input, #main summary, #main [tabindex]",
            );
            let lowest = 0;
            for (const el of interactive) {
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) continue;
              lowest = Math.max(lowest, rect.bottom);
            }
            const tab = document.querySelector(".tab-bar")?.getBoundingClientRect();
            return { maxBottom: lowest, tabTop: tab?.top ?? 0 };
          });

          expect(maxBottom).toBeLessThanOrEqual(tabTop + 1);
        });
      }

      // Export and Import stack rather than hyphenate: a word split over two
      // lines ("Expor-tieren") has one text rect per line.
      test("keeps the Export and Import labels on one line", async ({ page }) => {
        await page.goto("/settings");
        const lines = await page.locator(".data-actions .button-label > span").evaluateAll((spans) =>
          spans.map((span) => {
            const range = document.createRange();
            range.selectNodeContents(span);
            return range.getClientRects().length;
          }),
        );
        expect(lines).toEqual([1, 1]);
      });

      // The switch stays level with the first line of its label; a long label
      // wraps beside it instead of pushing it onto a line of its own.
      test("keeps each switch on the first line of its label", async ({ page }) => {
        await page.goto("/settings");
        const rows = await page.locator(".settings-row:has(.switch)").evaluateAll((list) =>
          list.map((row) => {
            const text = row.querySelector(".settings-label > span") as Element;
            const range = document.createRange();
            range.selectNodeContents(text);
            const first = range.getClientRects()[0];
            const knob = (row.querySelector(".switch") as Element).getBoundingClientRect();
            return {
              label: text.textContent,
              level: first !== undefined && knob.top < first.bottom && knob.bottom > first.top,
            };
          }),
        );
        expect(rows.length).toBeGreaterThan(0);
        expect(rows).toEqual(rows.map(({ label }) => ({ label, level: true })));
      });

      test("settings tab stays reachable", async ({ page }) => {
        await page.goto("/settings");
        await expect(page.locator('.tab-bar a[href="/settings"]')).toBeInViewport();
      });
    });
  }
}

test.describe("theme segmented control", () => {
  async function labelWidth(page: import("@playwright/test").Page) {
    await page.goto("/settings");
    const label = page.locator(".segmented__label").first();
    await expect(label).toBeAttached();
    const box = await label.boundingBox();
    return box?.width ?? 0;
  }

  async function isStacked(page: import("@playwright/test").Page) {
    const label = await page.locator("#theme-label").boundingBox();
    const control = await page.locator(".theme-field .segmented").boundingBox();
    return (control?.y ?? 0) >= (label?.y ?? 0) + (label?.height ?? 0);
  }

  test("stacks under its label on very narrow viewports, words intact", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    expect(await labelWidth(page)).toBeGreaterThan(10);
    expect(await isStacked(page)).toBe(true);
  });

  test("keeps its label visible beside the control on wide shells", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/settings");
    const label = await page.locator("#theme-label").boundingBox();
    const control = await page.locator(".theme-field .segmented").boundingBox();
    // A zero-width label means it collapsed and its text is under the control.
    expect(label?.width ?? 0).toBeGreaterThan(20);
    expect(label?.x ?? 0).toBeLessThan(control?.x ?? 0);
    expect((label?.x ?? 0) + (label?.width ?? 0)).toBeLessThanOrEqual((control?.x ?? 0) + 1);
  });

  test("sits beside its label once the shell is wide enough", async ({ page }) => {
    // Side by side only while the shell (the container) is wider than 448px:
    // the full 460px shell, not a phone.
    await page.setViewportSize({ width: 460, height: 780 });
    expect(await labelWidth(page)).toBeGreaterThan(10);
    expect(await isStacked(page)).toBe(false);
  });
});
