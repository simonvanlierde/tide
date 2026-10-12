# TODOs

- **Try dropping `style-src 'unsafe-inline'`.** React sets `style` props through the DOM, which CSP allows, so the
  policy may not need it. Check on a Cloudflare preview deploy with the browser console open before merging.
