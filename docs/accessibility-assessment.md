# WCAG 2.2 self-assessment

<!-- In the template the statement is accessibility.md.jinja, so the link checker cannot see it. -->
<!-- rumdl-disable-next-line MD057 -->
This is the criterion-by-criterion check behind the [accessibility statement](accessibility.md).
It has a row for every level A and AA success criterion of [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
The app does not serve this page; it lives in the repository only.

## Method and limits

The review follows the scope, sample and reporting steps of
[WCAG-EM](https://www.w3.org/TR/WCAG-EM/). A Pass means the browser checks found no failure
in this sample. It does not certify conformance. N/A means the sample has no applicable content.
Not assessed identifies a check that still needs evidence.

The statement may say "partially conformant" only once every row has a result, and its status
sentence must then link this page. Check the rows again when a change adds a page or a control,
and at least at each yearly review of the statement.

- **Date:** 12 November 2026
- **Who:** repository self-assessment. This is not an external audit.
- **Browser:** Chromium 156.0.8078.4 through Playwright 1.64.1.

No physical device, screen reader, speech input or switch hardware was available. Keyboard events,
the browser accessibility tree and native control semantics provide useful evidence, but do not
replace testing with assistive technology. Translated wording has not had a native-speaker review.

## Sample

Today, Calendar, Settings, Privacy and Accessibility; empty and populated histories; fertility on,
off and unanswered; flow picker, month picker, range logging and undo; insights and forecast dialogs;
help popovers; import error, import confirmation, export status and delete confirmation; local backup
reminder, populated cycle-history chart and table, and incomplete-cycle checkboxes. Release checks
also cover first-use guidance, the dated bleeding/diary editor and expiring Calendar confirmations.

The reproducible checks are in `tests/e2e/accessibility-manual.spec.ts`, `a11y.spec.ts`,
`viewport.spec.ts`, `reflow.spec.ts` and `legal-language.spec.ts`. The first file exercises keyboard
input, dialog cancellation, landscape, reduced motion, doubled root font size and WCAG text spacing.
The other files check the five routes, light and dark themes, all five languages, and widths from
280 to 430 CSS pixels. A 320 CSS pixel viewport provides the reflow check. Doubling root font size
checks text enlargement; it does not emulate browser zoom or an operating-system magnifier.

## Results

### Perceivable

| Criterion | Level | Result | Evidence |
| --- | --- | --- | --- |
| 1.1.1 Non-text Content | A | Pass | The dial has a text label; flow levels have named radios. History exposes every plotted cycle in a table and hides the duplicate chart from the accessibility tree. Icons are decorative or belong to named controls. |
| 1.2.1 Audio-only and Video-only (Prerecorded) | A | N/A | The sampled routes contain no audio or video. |
| 1.2.2 Captions (Prerecorded) | A | N/A | No prerecorded video. |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | A | N/A | No prerecorded video. |
| 1.2.4 Captions (Live) | AA | N/A | No live media. |
| 1.2.5 Audio Description (Prerecorded) | AA | N/A | No prerecorded video. |
| 1.3.1 Info and Relationships | A | Pass | Browser roles expose headings, calendar weekday headers, history row and column headers, labelled settings and the flow fieldset. The history test checks the table and checkbox description. |
| 1.3.2 Meaningful Sequence | A | Pass | Browser reading order follows title, content, actions and primary navigation. Dialog content reads in its visual order. The chart's duplicate is hidden; the table remains. |
| 1.3.3 Sensory Characteristics | A | Pass | Logging, import and incomplete-cycle instructions name controls or dates; none requires finding only a shape, position or sound. |
| 1.3.4 Orientation | AA | Pass | Every route retains its content and navigation at 844 × 390 landscape and 320 × 640 portrait. No orientation lock. |
| 1.3.5 Identify Input Purpose | AA | N/A | No fields collect personal details from the input-purpose list. Cycle dates are not those fields. |
| 1.4.1 Use of Color | A | Pass | Logged and expected periods have different fills and outlines. The flow picker names each level. History distinguishes included circles from excluded crosses and provides text and checkbox states in its table. |
| 1.4.2 Audio Control | A | N/A | No audio plays. |
| 1.4.3 Contrast (Minimum) | AA | Pass | Light and dark axe scans cover all five routes, help overlays, forecast dialog, backup reminder and populated history dialog. Text in the final history and backup screenshots remains readable. Scans wait for the dialog's entrance animation to finish. |
| 1.4.4 Resize Text | AA | Pass | Doubling the root font size retains content on all five routes. The regression first exposed dial and flow-label overflow; the dial now respects its container and flow levels use two columns. Actual browser zoom and magnification remain untested. |
| 1.4.5 Images of Text | AA | N/A | Labels, dates, headings and dial numerals render as text. Icons contain no essential words. |
| 1.4.10 Reflow | AA | Pass | All five routes fit at 320 CSS pixels. The populated history dialog also retains content with increased text spacing at that width. |
| 1.4.11 Non-text Contrast | AA | Pass | Rendered colors give light-theme minimum ratios of 3.28:1 for focus indicators, 3.49:1 for forecast outlines, 6.35:1 for history points and 5.49:1 for axes. Dark equivalents are 5.36:1, 5.36:1, 8.23:1 and 6.81:1. Off-switch thumb-to-track contrast passes 3:1 in both themes. Flow colors supplement named levels and a selected outline; history also has a table. |
| 1.4.12 Text Spacing | AA | Pass | At 320 pixels, every route and the populated history dialog fit with 1.5 line height, .12em letter spacing, .16em word spacing and 2em paragraph spacing. |
| 1.4.13 Content on Hover or Focus | AA | Pass | Help uses explicit details toggles. Keyboard users open with Enter and close with Escape; content stays open while reading. No tooltip appears only on hover or focus. |

### Operable

| Criterion | Level | Result | Evidence |
| --- | --- | --- | --- |
| 2.1.1 Keyboard | A | Pass | Keyboard checks operate the skip link, dialog, calendar arrows, flow radios, delete cancellation, history checkbox and backup snooze. Native buttons, selects and links expose the remaining actions. |
| 2.1.2 No Keyboard Trap | A | Pass | Escape leaves the native dialog and restores its trigger; closing the flow picker restores its day button. Tab cannot reach a background control while a modal is open. |
| 2.1.4 Character Key Shortcuts | A | N/A | No character-only keyboard shortcuts. Calendar and dial use arrow keys and navigation keys. |
| 2.2.1 Timing Adjustable | A | Not assessed | Calendar's Undo confirmation expires after ten seconds. Hover or focus pauses it; logged days remain editable afterward. Timer behavior is browser-tested, but this criterion needs reassessment for the new control. |
| 2.2.2 Pause, Stop, Hide | A | N/A | No automatically updating feed or moving information lasting over five seconds. |
| 2.3.1 Three Flashes or Below Threshold | A | Pass | No flashing content in the sampled screens or transitions. Reduced-motion mode has no ongoing CSS animation. |
| 2.4.1 Bypass Blocks | A | Pass | First Tab exposes Skip to content; Enter focuses main. |
| 2.4.2 Page Titled | A | Pass | The app title is Tide. Privacy and Accessibility add their page names to the document title. |
| 2.4.3 Focus Order | A | Pass | The skip link precedes content. Calendar has one roving tab stop; arrows move between dates. Modal and picker close restore the opener. Backup snooze retains a focused page control. |
| 2.4.4 Link Purpose (In Context) | A | Pass | Primary links name Today, Calendar and Settings. Legal, import, email and issue links name their destinations or purpose. |
| 2.4.5 Multiple Ways | AA | Pass | Primary navigation reaches all three app screens. Settings links legal pages; each legal page links back to Settings. Browser history and direct URLs also work. |
| 2.4.6 Headings and Labels | AA | Pass | Each route has a heading. Settings, dialogs, flow options and history checkboxes have names that describe their action or value. |
| 2.4.7 Focus Visible | AA | Pass | Tab inspection of every route in both themes shows focus outlines on links, buttons, selects, the dial and help toggles. Flow radios outline their visible swatch; the history checkbox keeps its native focus indicator. |
| 2.4.11 Focus Not Obscured (Minimum) | AA | Pass | Tab inspection across every route at 320 and 1280 pixels in both themes finds no fully hidden focused control. A regression first exposed Settings links behind the fixed navigation; document scroll padding now reserves that space. |
| 2.5.1 Pointer Gestures | A | Pass | Calendar swipe has previous and next buttons. Pressing a point on the dial previews that day without tracing a path. No task requires a multi-pointer gesture. |
| 2.5.2 Pointer Cancellation | A | Pass | Logging, settings and destructive confirmations activate on click or native change, after pointer release. The calendar swipe only changes month on release. |
| 2.5.3 Label in Name | A | Pass | Visible button and link words form their names. Named calendar days include their visible day number; history checkboxes include Incomplete and their cycle date. |
| 2.5.4 Motion Actuation | A | N/A | No device-motion or camera gesture input. |
| 2.5.7 Dragging Movements | AA | Pass | Month buttons replace calendar swiping. Pressing a point on the dial previews that day without moving the pointer. Dragging is not required for logging or reading estimates. |
| 2.5.8 Target Size (Minimum) | AA | Pass | Explicit axe target-size checks measure the five routes at 320 pixels and the populated history dialog. No undersized or overlapping target, or unresolved check, was reported. The rule is normally disabled, so the test enables it by name. |

### Understandable

| Criterion | Level | Result | Evidence |
| --- | --- | --- | --- |
| 3.1.1 Language of Page | A | Pass | The html language follows the chosen app language. Legal-language checks cover English, German, Spanish, French and Dutch. |
| 3.1.2 Language of Parts | AA | Pass | English-only legal articles expose lang=en while their return navigation follows the app language. |
| 3.2.1 On Focus | A | Pass | Tabbing and focusing controls does not change route, submit data or open a dialog. Enter, Space or pointer activation performs actions. |
| 3.2.2 On Input | A | Pass | Preference changes update the named preference in place. Choosing an import file either shows its error or explains replacement in a confirmation. |
| 3.2.3 Consistent Navigation | AA | Pass | Every sampled route retains the same Today, Calendar and Settings navigation in the same order. |
| 3.2.4 Consistent Identification | AA | Pass | Navigation, flow levels, close, cancel and data actions keep the same names and roles across screens. |
| 3.2.6 Consistent Help | A | Pass | Settings keeps About and the legal links in one place. Accessibility provides the same email and issue contact regardless of the route used to reach it. |
| 3.3.1 Error Identification | A | Pass | Invalid import shows the named file-format problem in an alert. No data changes on that error. |
| 3.3.2 Labels or Instructions | A | Pass | Settings select labels, flow legend, import format guidance and incomplete-cycle description identify inputs and their effect. |
| 3.3.3 Error Suggestion | AA | Pass | Import errors name the accepted Tide, Clue and Flo formats. The input remains available to choose a different file. |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | Pass | Deleting all data and replacing existing history require confirmation. Escape cancels deletion and preserves five seeded days. Calendar logging provides undo; incomplete flags keep the underlying days. |
| 3.3.7 Redundant Entry | A | N/A | No multi-step workflow asks for the same information again. |
| 3.3.8 Accessible Authentication (Minimum) | AA | N/A | No account or authentication. |

### Robust

| Criterion | Level | Result | Evidence |
| --- | --- | --- | --- |
| 4.1.2 Name, Role, Value | A | Pass | Browser roles expose named native radios, selects, checkboxes, buttons, tables and dialogs. Keyboard selection updates checked states; the history test verifies its checkbox and description. |
| 4.1.3 Status Messages | AA | Pass | Invalid import exposes an alert. Successful export exposes a status without moving focus. Calendar logging, undo and import outcomes use status regions. Actual screen-reader announcements remain untested. |

WCAG 2.2 removed 4.1.1 Parsing, so it is not listed.

## Summary

Of 55 level A and AA criteria, 41 pass in this browser sample, 13 do not apply and one needs
reassessment for the timed Calendar confirmation. No failures were found in the assessed rows.
Focused browser checks, route scans, reflow and legal-language checks pass.
This is evidence for the tested states, not a conformance
certification or evidence of screen-reader support.

Repeat the sample when controls or pages change. The next checks need a person using a screen
reader and an installed PWA on physical devices. Native-speaker review of the translations also
remains outside this assessment.
