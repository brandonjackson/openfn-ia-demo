import { describe, expect, it } from "vitest";
import { credentialsForStep, stepMissingCredential, stepNeedsCredential } from "./step-credentials";
import type { ConnectedSystem } from "./connected-systems";
import type { ProjectCredential } from "./adaptor-reference";

const direct = { connection: undefined } as ConnectedSystem;
const viaXRoad = { connection: { method: "xroad" } } as ConnectedSystem;

describe("step credentials", () => {
  it("needs one when its adaptor does, unless its system is reached over X-Road", () => {
    expect(stepNeedsCredential({ needsCredential: true })).toBe(true);
    expect(stepNeedsCredential({ needsCredential: true }, direct)).toBe(true);
    expect(stepNeedsCredential({ needsCredential: true }, viaXRoad)).toBe(false);
    expect(stepNeedsCredential({ needsCredential: false }, direct)).toBe(false);
    expect(stepNeedsCredential(undefined)).toBe(false);
  });

  it("is missing one only when it needs one and has none", () => {
    expect(stepMissingCredential({ needsCredential: true }, direct, undefined)).toBe(true);
    expect(stepMissingCredential({ needsCredential: true }, direct, "cred")).toBe(false);
    expect(stepMissingCredential({ needsCredential: true }, viaXRoad, undefined)).toBe(false);
  });

  it("offers the credentials on the step's adaptor with values where it runs", () => {
    const credentials: ProjectCredential[] = [
      { id: "a", name: "Prod", adaptor: "http", owner: "x", environments: ["production"] },
      { id: "b", name: "Staging", adaptor: "http", owner: "x", environments: ["staging"] },
      { id: "c", name: "Unknown", adaptor: "http", owner: "x" },
      { id: "d", name: "Other", adaptor: "dhis2", owner: "x", environments: ["staging"] },
    ];
    expect(credentialsForStep(credentials, "http", "staging").map((c) => c.id)).toEqual(["b", "c"]);
    expect(credentialsForStep(credentials, "http", "production").map((c) => c.id)).toEqual(["a", "c"]);
  });
});
