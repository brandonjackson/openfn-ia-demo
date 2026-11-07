import { describe, expect, it } from "vitest";
import { isOpenable, type ProjectDetails } from "./projects";

const project = (change: Partial<ProjectDetails>) => ({ scheduledDeletion: null, ...change }) as ProjectDetails;

describe("which projects you can open", () => {
  it("opens one you have a role in, and one the API listed without saying (Lightning only lists yours)", () => {
    expect(isOpenable(project({ role: "viewer" }))).toBe(true);
    expect(isOpenable(project({}))).toBe(true);
  });

  it("doesn't open one you're not a member of, or one being deleted", () => {
    expect(isOpenable(project({ role: null }))).toBe(false);
    expect(isOpenable(project({ role: "owner", scheduledDeletion: "2026-11-10T00:00:00Z" }))).toBe(false);
  });
});
