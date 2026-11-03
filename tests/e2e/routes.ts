// Every route the app serves. The accessibility, CSP, privacy and legal-page specs
// visit each one, so add new routes here.
export const ROUTES = ["/", "/calendar", "/settings", "/accessibility", "/privacy"];

// The routes that link every legal page, checked by legal-pages.spec.ts: Settings > About.
export const LEGAL_LINKED_FROM: readonly string[] = ["/settings"];
