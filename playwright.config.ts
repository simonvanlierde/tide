import process from "node:process";
import { defineConfig, devices } from "@playwright/test";

const ci = Boolean(process.env.CI);
// Not vite preview's default 4173, so another app's preview server is never mistaken
// for this one. --strictPort fails the run if it is taken, instead of serving on
// another port the tests never reach.
const url = "http://127.0.0.1:4179";

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: ci,
  reporter: ci ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: { baseURL: url, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // The tests run against the production build, which is what Cloudflare Pages serves.
  webServer: {
    command: "pnpm build && pnpm preview --host 127.0.0.1 --port 4179 --strictPort",
    url,
    // Always a fresh build: a server left running may serve an older one.
    reuseExistingServer: false,
    // A cold `vite build` outruns the 60s default.
    timeout: 180_000,
  },
});
