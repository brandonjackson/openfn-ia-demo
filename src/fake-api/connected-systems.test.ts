import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { apiSystemId } from "../fixtures/ids";
import { resetFakeApi, setWait } from ".";

const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
const list = () => request<{ data: { id: string; attributes: { name: string } }[] }>("GET", "/api/demo/connected_systems?page_size=100").then((r) => r.data);

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("connected systems", () => {
  it("adds a system, refusing a name that's taken or a URL that isn't one", async () => {
    const id = crypto.randomUUID();
    expect((await refusal(request("PUT", `/api/demo/connected_systems/${id}`, { name: "DHIS2", adaptor: "dhis2" })))?.fieldErrors["name"]).toEqual(["has already been taken"]);
    expect((await refusal(request("PUT", `/api/demo/connected_systems/${id}`, { name: "Lab", adaptor: "http", apiDocsUrl: "docs" })))?.fieldErrors["apiDocsUrl"]).toBeTruthy();
    await request("PUT", `/api/demo/connected_systems/${id}`, { name: "Lab results", adaptor: "http" });
    expect((await list()).some((s) => s.id === id)).toBe(true);
  });

  it("revokes one grant, and deletes a system with all its grants", async () => {
    const dhis2 = apiSystemId("dhis2");
    const grants = () => request<{ data: { id: string }[] }>("GET", `/api/demo/connected_systems/${dhis2}/access_grants`).then((r) => r.data);
    const before = await grants();
    await request("DELETE", `/api/demo/connected_systems/${dhis2}/access_grants/${before[0]!.id}`);
    expect(await grants()).toHaveLength(before.length - 1);
    await request("DELETE", `/api/demo/connected_systems/${dhis2}`);
    expect((await list()).some((s) => s.id === dhis2)).toBe(false);
    expect((await refusal(grants()))?.code).toBe("not_found");
  });
});
