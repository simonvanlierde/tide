import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://127.0.0.1:4179" },
  webServer: {
    command:
      "pnpm build && pnpm preview --host 127.0.0.1 --port 4179 --strictPort",
    url: "http://127.0.0.1:4179",
    reuseExistingServer: false,
    // A cold `vite build` outruns the 60s default.
    timeout: 180_000,
  },
});
