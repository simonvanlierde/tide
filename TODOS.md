# TODOs

- **Try dropping `style-src 'unsafe-inline'`.** React sets `style` props through the DOM, which CSP allows, so the
  policy may not need it. Check on a Cloudflare preview deploy with the browser console open before merging.
- **Grid semantics for the calendar.** Day buttons sit in a plain section; `role="grid"` with rows and column headers
  would let screen readers announce the weekday.
- **Separate maskable icon.** The manifest marks both icons `any maskable`; a padded maskable icon avoids cropped
  edges on Android.
