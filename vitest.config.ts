import { defineConfig } from "vitest/config";

// Unit tests: the fake server's lifecycles and the API hooks' mappers. They run in Node, with no browser.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
