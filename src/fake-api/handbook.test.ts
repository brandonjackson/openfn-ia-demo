import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { handbookSections } from "../fixtures/handbook";
import { fromMarkdown, toMarkdown } from "../model/handbook-markdown";
import { resetFakeApi, seedEmpty, setWait, signInAs } from ".";

const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type File = { id: string; attributes: { name: string; kind: string; added_by: string } };
const files = () => request<{ data: File[] }>("GET", "/api/demo/handbook/files").then((r) => r.data);
const MB = 1024 * 1024;

beforeEach(() => {
  setWait(0);
  seedEmpty(false);
  resetFakeApi();
  forgetCsrfToken();
});

describe("handbook files", () => {
  it("adds a file of a type it takes, newest first, and removes it", async () => {
    const { data } = await request<{ data: File }>("POST", "/api/demo/handbook/files", { name: "Data sharing agreement v2.docx", bytes: 120_000 });
    expect(data.attributes).toMatchObject({ kind: "doc", added_by: "Jane Doe" });
    expect((await files())[0]!.id).toBe(data.id);
    await request("DELETE", `/api/demo/handbook/files/${data.id}`);
    expect((await files()).some((f) => f.id === data.id)).toBe(false);
  });

  it("refuses a type it doesn't take, a name it already has, and a file that won't fit", async () => {
    const [first] = await files();
    const bad = await refusal(request("POST", "/api/demo/handbook/files", { name: "setup.exe", bytes: 10 }));
    expect(bad?.fieldErrors["name"]?.[0]).toMatch(/isn't a type/);
    expect((await refusal(request("POST", "/api/demo/handbook/files", { name: first!.attributes.name, bytes: 10 })))?.fieldErrors["name"]).toEqual(["is already in the handbook"]);
    expect((await refusal(request("POST", "/api/demo/handbook/files", { name: "huge.pdf", bytes: 60 * MB })))?.fieldErrors["bytes"]?.[0]).toMatch(/over its 50 MB/);
  });

  it("saves the article and who edited it, refusing a section without a heading or one named twice", async () => {
    type Handbook = { data: { attributes: { sections: { title: string }[]; updated_by: string } } };
    const get = () => request<Handbook>("GET", "/api/demo/handbook").then((r) => r.data.attributes);
    const section = (title: string) => ({ id: title || "x", title, blocks: [{ type: "paragraph", content: ["Hi ", { text: "projects", to: "/projects" }] }] });
    signInAs("user-beth");
    await request("PUT", "/api/demo/handbook/article", { sections: [section("About"), section("Contacts")] });
    expect(await get()).toMatchObject({ sections: [{ title: "About" }, { title: "Contacts" }], updated_by: expect.not.stringMatching(/^Someone$/) });
    expect((await refusal(request("PUT", "/api/demo/handbook/article", { sections: [section("")] })))?.fieldErrors["sections.0.title"]).toBeTruthy();
    expect((await refusal(request("PUT", "/api/demo/handbook/article", { sections: [section("A"), section("a")] })))?.fieldErrors["sections.1.title"]).toBeTruthy();
    expect((await refusal(request("PUT", "/api/demo/handbook/article", { sections: [] })))?.fieldErrors["sections"]).toBeTruthy();
    signInAs("user-priya");
    expect((await refusal(request("PUT", "/api/demo/handbook/article", { sections: [section("X")] })))?.code).toBe("forbidden");
  });

  it("saves the seeded article as edited in Markdown, unchanged", async () => {
    // Plain text the fixture splits in two comes back as one string, so compare as Markdown.
    const markdown = toMarkdown(handbookSections);
    await request("PUT", "/api/demo/handbook/article", { sections: fromMarkdown(markdown) });
    const { data } = await request<{ data: { attributes: { sections: typeof handbookSections } } }>("GET", "/api/demo/handbook");
    expect(toMarkdown(data.attributes.sections)).toBe(markdown);
  });

  it("lets anyone in the organisation change it, and no one else", async () => {
    signInAs("user-beth");
    await request("POST", "/api/demo/handbook/files", { name: "notes.md", bytes: 10 });
    signInAs("user-priya");
    await expect(files()).resolves.toBeTruthy();
    expect((await refusal(request("POST", "/api/demo/handbook/files", { name: "more.md", bytes: 10 })))?.code).toBe("forbidden");
  });
});

describe("beside Lightning", () => {
  it("saves the first article, where the handbook starts empty", async () => {
    seedEmpty();
    type Handbook = { data: { attributes: { sections: { title: string }[]; updated_at: string | null } } };
    const get = () => request<Handbook>("GET", "/api/demo/handbook").then((r) => r.data.attributes);
    expect((await get()).sections).toEqual([]);
    await request("PUT", "/api/demo/handbook/article", { sections: fromMarkdown("## About us\n\nWe move data.") });
    const saved = await get();
    expect(saved.sections.map((s) => s.title)).toEqual(["About us"]);
    expect(saved.updated_at).toBeTruthy();
  });
});
