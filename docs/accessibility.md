<!--
Keep this page true. The app serves it at /accessibility, without this note.
https://github.com/simonvanlierde/project-templates/blob/main/docs/web-legal.md
says how to fill it in, and how the template builds and tests it.
Say "partially conformant" only once docs/accessibility-assessment.md has a result for every
criterion, and link it from the status sentence.
-->

# Accessibility statement

This page covers tide at [tide.duinlab.nl](https://tide.duinlab.nl). Simon van Lierde builds tide
and is responsible for this page.

## Using tide

You can:

- use tide on a screen 320 px wide without scrolling sideways;
- choose a dark theme in Settings, or let tide follow your device;
- use tide in English, German, Spanish, French or Dutch;
- turn off animations with your device's reduced-motion setting.

## How accessible tide is

tide aims to meet [WCAG 2.2](https://www.w3.org/TR/WCAG22/) at level AA, the usual standard for
accessible websites.

Its conformance is **not assessed** beyond the tested browser sample. The
[repository self-assessment](https://github.com/simonvanlierde/tide/blob/main/docs/accessibility-assessment.md)
records all 55 level A and AA criteria: 41 pass in that sample, 13 do not apply and the
timed Calendar confirmation needs reassessment.
These results do not establish WCAG conformance. No outside expert has tested tide.

## Known problems

No failures remain in the tested browser sample. Screen-reader use, browser zoom and installed
apps on physical devices still need testing. These gaps limit what we can say about accessibility.

## Tell us about a problem

If any part of tide is hard or impossible for you to use, email
[code@duinlab.nl](mailto:code@duinlab.nl). Tell us what you tried to do, what happened, and which
browser and assistive technology you use, if any. If you have a GitHub account, you can also
[open an issue](https://github.com/simonvanlierde/tide/issues/new).

We'll reply within 10 working days. If you need something from tide in another format, ask and
we'll send it.

## How we check

These automatic checks run on every proposed change to tide:

- [axe-core](https://github.com/dequelabs/axe-core) scans every page, in the light and the dark
  theme, for WCAG 2.0, 2.1 and 2.2 level A and AA problems and axe's best practices.
- Every page loads 320 px wide, and the test fails if it scrolls sideways.
- Keyboard tests check dialogs, calendar controls, flow selection, incomplete-cycle checkboxes and
  backup reminders. They also check that fixed navigation does not hide a focused Settings link.
- Tests enlarge the root font to 200%, increase text spacing and check landscape orientation.
  Pointer-target checks explicitly enable axe's target-size rule, which is off by default.
- [Biome's accessibility rules](https://biomejs.dev/linter/javascript/rules/#a11y) check the code
  for mistakes such as missing alt text, invalid ARIA, or click handlers that don't work with a
  keyboard.
- A test fails if this page loses a section or its email contact, claims a status it hasn't
  earned, or goes more than 400 days without a review.

Automatic tools find only some problems, so passing them doesn't mean there are none. The tests
are in [tests/e2e](https://github.com/simonvanlierde/tide/tree/main/tests/e2e).

## Tested with

- Chromium 156.0.8078.4 through Playwright, with axe-core, in light and dark themes.
- Browser keyboard events, focus inspection and accessibility-tree checks at widths of 320 and
  1280 CSS pixels. Responsive tests also cover all five languages at widths from 280 to 430 pixels.

No physical device, screen reader, speech input or switch hardware was available for this review.
Simulated keyboard input and browser semantics do not replace those checks. tide needs HTML, CSS
and JavaScript to work.

## About this statement

Prepared: 29 October 2026

Last reviewed: 12 November 2026

Next review: within 12 months of the last review, or at the next major release if that comes first.

Method: self-assessment, using the checks under How we check.
