import type { Page } from "@playwright/test";

/**
 * Every rendered element whose content spills out of its own box (wider or
 * taller than the box, unless the box scrolls) or past the viewport's left or
 * right edge. Each entry names the element and its text, so a failure says
 * which word did not fit.
 */
export function findOverflow(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    // Let a just-opened popover finish placing itself (it moves on "toggle",
    // which fires after the click).
    await new Promise((done) =>
      requestAnimationFrame(() => requestAnimationFrame(done)),
    );
    const viewport = document.documentElement.clientWidth;
    const found: string[] = [];
    const report = (el: Element, why: string) => {
      const name =
        el.tagName.toLowerCase() +
        (el.classList.length ? `.${[...el.classList].join(".")}` : "");
      const text = (el.textContent ?? "").trim().replace(/\s+/g, " ");
      found.push(`${name} "${text.slice(0, 60)}": ${why}`);
    };
    // Screen-reader-only text is clipped to 1px on purpose, a closed <details>
    // still lays out its hidden content, and an SVG's children are drawing,
    // not layout.
    const rendered = [...document.body.querySelectorAll("*")].filter(
      (el) =>
        !el.closest(".visually-hidden, details:not([open]) > :not(summary)") &&
        !el.parentElement?.closest("svg") &&
        getComputedStyle(el).visibility !== "hidden" &&
        el.getClientRects().length > 0,
    );

    for (const el of rendered) {
      const rect = el.getBoundingClientRect();
      if (rect.left < -1 || rect.right > viewport + 1) {
        report(
          el,
          `spans ${Math.round(rect.left)}..${Math.round(rect.right)} in a ${viewport}px viewport`,
        );
      }
    }

    // For the box check, a floating panel is lifted out of its anchor, which
    // it overlaps by design, and pseudo-elements are left out: here they are
    // hit areas and decoration that reach past their box on purpose (a 44px
    // target around a 24px icon).
    const lift = document.createElement("style");
    lift.textContent = `
      .info-popover__content { position: fixed !important; }
      *::before, *::after { content: none !important; }`;
    document.head.append(lift);
    for (const el of rendered) {
      if (!(el instanceof HTMLElement)) continue;
      const style = getComputedStyle(el);
      // +1 tolerates sub-pixel rounding, not a real overflowing element.
      if (
        el.clientWidth > 0 &&
        !/auto|scroll/.test(style.overflowX) &&
        el.scrollWidth > el.clientWidth + 1
      ) {
        report(el, `content ${el.scrollWidth}px wide in ${el.clientWidth}px`);
      }
      if (
        el.clientHeight > 0 &&
        !/auto|scroll/.test(style.overflowY) &&
        el.scrollHeight > el.clientHeight + 1 &&
        !isOneLineOfText(el)
      ) {
        report(el, `content ${el.scrollHeight}px tall in ${el.clientHeight}px`);
      }
    }
    lift.remove();
    return found;

    // A single line set tighter than its font's own height (the 0.86 line
    // height of the dial numeral) pokes out of its box by design; only a box
    // too short for its wrapped lines is a real overflow.
    function isOneLineOfText(el: HTMLElement) {
      if (el.children.length > 0) return false;
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getClientRects().length <= 1;
    }
  });
}
