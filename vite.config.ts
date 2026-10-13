import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
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

export default defineConfig({
  // The only lazy chunk is the other-app import, which needs nothing beyond the
  // main chunk, so the modulepreload polyfill is dead weight in the budget.
  build: { modulePreload: false },
  plugins: [
    react(),
    VitePWA({
      // The manifest icons are precached on their own (includeManifestIcons).
      includeAssets: ["favicon.ico", "icons/icon.svg"],
      registerType: "autoUpdate",
      manifest,
    }),
  ],
});
