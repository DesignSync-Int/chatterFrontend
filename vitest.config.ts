import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    coverage: {
      exclude: ["src/main.tsx", "*.config.*"], // Exclude main.tsx from coverage
      reporter: ["text", "json", "html"],
    },
  },
});
