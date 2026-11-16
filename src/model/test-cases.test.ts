import { describe, expect, it } from "vitest";
import { asksToGenerateTests, generateTestsPrompt } from "./test-cases";

describe("asksToGenerateTests", () => {
  it("hears the suggestion and the ways people put it", () => {
    expect(asksToGenerateTests(generateTestsPrompt)).toBe(true);
    expect(asksToGenerateTests("Write tests from spec.md")).toBe(true);
    expect(asksToGenerateTests("can you sync the tests with the spec?")).toBe(true);
  });

  it("leaves other questions to the assistant", () => {
    expect(asksToGenerateTests("How do I test this with sample data?")).toBe(false);
    expect(asksToGenerateTests("Explain what this workflow does")).toBe(false);
    expect(asksToGenerateTests("Update the spec")).toBe(false);
  });
});
