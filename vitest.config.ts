import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["tests/e2e/**"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**"],
      exclude: [
        "src/main.tsx",
        "src/**/*.css",
        "src/**/types.ts",
        "src/ui/icons.tsx",
      ],
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 80,
        branches: 85,
      },
    },
  },
});
