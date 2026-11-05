import { defineConfig } from "vitest/config";

// Reason: Vitest's default glob also matches *.spec.ts, which would pick up the Playwright suite.
export default defineConfig({
  test: { include: ["tests/lib/**/*.test.ts"] },
});
