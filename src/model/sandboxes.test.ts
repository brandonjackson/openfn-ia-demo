import { describe, expect, it } from "vitest";
import { sandboxNames, sandboxNameError } from "./sandboxes";

describe("sandboxNames", () => {
  it("lists main first, then each live sandbox once", () => {
    expect(
      sandboxNames([
        { name: "fix", scheduledDeletion: null },
        { name: "gone", scheduledDeletion: "2026-12-01" },
        // A sandbox of a sandbox can share a name with one elsewhere in the tree.
        { name: "fix", scheduledDeletion: null },
        { name: "try", scheduledDeletion: null },
      ]),
    ).toEqual(["main", "fix", "try"]);
  });
});

describe("sandboxNameError", () => {
  it("checks the slug a name becomes, not the name as typed", () => {
    expect(sandboxNameError("Fix Bug", ["fix-bug"])).toBe("There's already a sandbox called fix-bug.");
    expect(sandboxNameError("Main", [])).toMatch(/^Main is the project's own line/);
    expect(sandboxNameError("new idea", ["fix-bug"])).toBeUndefined();
  });
});
