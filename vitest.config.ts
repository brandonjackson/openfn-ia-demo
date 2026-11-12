import { defineConfig } from "vitest/config";

// Two kinds of test. `.test.ts` runs in Node: the fake server's lifecycles and pure helpers.
// `.test.tsx` runs in jsdom: a page drawn from props, and a page's .query wrapper on the fake server.
export default defineConfig({
  test: {
    projects: [
      { extends: true, test: { name: "unit", include: ["src/**/*.test.ts", "scripts/**/*.test.ts"], environment: "node" } },
      { extends: true, test: { name: "pages", include: ["src/**/*.test.tsx"], environment: "jsdom", setupFiles: ["src/test/setup.ts"] } },
    ],
  },
});
