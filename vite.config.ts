import react from "@vitejs/plugin-react";
import { marked } from "marked";
import { defineConfig, type Plugin } from "vite";
import type { ManifestOptions } from "vite-plugin-pwa";
import { VitePWA } from "vite-plugin-pwa";

const manifest: Partial<ManifestOptions> = {
  name: "Tide",
  short_name: "Tide",
  description: "A private period tracker that keeps cycle data on this device.",
  id: "/",
  start_url: "/",
  scope: "/",
  display: "standalone",
  theme_color: "#f5f9f9",
  background_color: "#f5f9f9",
  // The same artwork serves both purposes: the ring spans 68% of the width,
  // already inside the 80% circle that Android's mask shapes keep, so a padded
  // copy would only shrink it. Listed per purpose, since a combined
  // "any maskable" entry is discouraged.
  icons: (["any", "maskable"] as const).flatMap((purpose) =>
    [192, 512].map((size) => ({
      src: `/icons/icon-${size}.png`,
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose,
    })),
  ),
};

/**
 * Turns an imported .md file into its HTML at build time, so the pages in docs/
 * ship as HTML and no Markdown code reaches the browser. GitHub shows the same files.
 * HTML comments are notes for the author, so they are dropped before visitors see them.
 */
export const markdown = (): Plugin => ({
  name: "markdown-html",
  transform(code, id) {
    if (id.endsWith(".md")) {
      // Strip until nothing changes: one pass over "<!<!---->---->" leaves a comment behind.
      let text = code;
      for (let before = ""; before !== text; ) {
        before = text;
        text = text.replace(/<!--[\s\S]*?-->/g, "");
      }
      const html = marked.parse(text, { async: false });
      return { code: `export default ${JSON.stringify(html)};`, map: null };
    }
  },
});

export default defineConfig({
  // The lazy chunks (other-app import, forecast sheet, calendar file) need
  // nothing beyond the main chunk, so the modulepreload polyfill is dead
  // weight in the budget.
  build: { modulePreload: false },
  plugins: [
    react(),
    markdown(),
    VitePWA({
      // The manifest icons are precached on their own (includeManifestIcons).
      includeAssets: ["favicon.ico", "icons/icon.svg"],
      registerType: "autoUpdate",
      manifest,
    }),
  ],
});
