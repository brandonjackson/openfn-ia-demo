import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, listAll } from "../api/client";
import { resetFakeApi, setWait } from ".";

type Idea = { id: string; title: string; systems: string[]; prompt: string };

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("build ideas (the demo's own route)", () => {
  it("lists every starter idea, each with a UUID, the systems it connects and its prompt", async () => {
    const ideas = await listAll<Idea>("/api/demo/build_ideas");
    expect(ideas.length).toBeGreaterThan(0);
    const benefits = ideas.find((i) => i.title === "Enrol newborns in child benefits")!;
    expect(benefits.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(benefits.systems).toEqual(["OpenCRVS", "Salesforce"]);
    expect(benefits.prompt).toContain("OpenCRVS");
  });
});
