import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { resetFakeApi, setWait, signInAs } from ".";

const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type File = { id: string; attributes: { name: string; kind: string; added_by: string } };
const files = () => request<{ data: File[] }>("GET", "/api/demo/handbook/files").then((r) => r.data);
const MB = 1024 * 1024;

beforeEach(() => {
  setWait(0);
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

  it("lets anyone in the organisation change it, and no one else", async () => {
    signInAs("user-beth");
    await request("POST", "/api/demo/handbook/files", { name: "notes.md", bytes: 10 });
    signInAs("user-priya");
    await expect(files()).resolves.toBeTruthy();
    expect((await refusal(request("POST", "/api/demo/handbook/files", { name: "more.md", bytes: 10 })))?.code).toBe("forbidden");
  });
});
