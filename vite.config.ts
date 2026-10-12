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
  icons: [
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any maskable",
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
  ],
};

export default defineConfig({
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
