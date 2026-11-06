import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { resetFakeApi, setWait, signInAs } from ".";
import { projectIdFor } from "./projects";

const a = projectIdFor("project-a");
const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Component = { id: string; attributes: Record<string, unknown> };
const list = () => request<{ data: Component[] }>("GET", `/api/demo/projects/${a}/components?page_size=100`);
const path = (id: string) => `/api/demo/projects/${a}/components/${id}`;

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("components", () => {
  it("lists a project's seeded forms, artifacts, skills, documents and websites with their content", async () => {
    const { data } = await list();
    const types = new Set(data.map((c) => c.attributes["component_type"]));
    expect(types).toEqual(new Set(["Form", "Artifact", "AI Skill", "Document", "Static Website"]));
    expect(data.every((c) => typeof c.attributes["content"] === "string" && (c.attributes["content"] as string).length > 0)).toBe(true);
  });

  it("makes, changes (bumping its version) and deletes a component", async () => {
    const id = crypto.randomUUID();
    const made = await request<{ data: Component }>("PUT", path(id), { component_type: "Document", name: "Runbook", content: "# Runbook" });
    expect(made.data.attributes).toMatchObject({ component_type: "Document", name: "Runbook", lock_version: 1 });
    const changed = await request<{ data: Component }>("PUT", path(id), { content: "# Runbook\n\nStep one.", lock_version: 1 });
    expect(changed.data.attributes).toMatchObject({ content: "# Runbook\n\nStep one.", lock_version: 2, name: "Runbook" });
    expect((await refusal(request("PUT", path(id), { content: "stale", lock_version: 1 })))?.code).toBe("concurrent_edit");
    await request("DELETE", path(id));
    expect((await list()).data.some((c) => c.id === id)).toBe(false);
  });

  it("keeps names unique within a type, and a type fixed once it's made", async () => {
    const { data } = await list();
    const form = data.find((c) => c.attributes["component_type"] === "Form")!;
    const id = crypto.randomUUID();
    expect((await refusal(request("PUT", path(id), { component_type: "Form", name: form.attributes["name"], content: "{}" })))?.fieldErrors["name"]).toEqual(["has already been taken"]);
    await request("PUT", path(id), { component_type: "Document", name: form.attributes["name"] });
    expect((await refusal(request("PUT", path(id), { component_type: "Form" })))?.fieldErrors["component_type"]).toEqual(["can't be changed"]);
    expect((await refusal(request("PUT", path(crypto.randomUUID()), { component_type: "Workflow", name: "x" })))?.fieldErrors["component_type"]).toBeTruthy();
  });

  it("refuses a form or artifact whose content isn't JSON", async () => {
    const id = crypto.randomUUID();
    expect((await refusal(request("PUT", path(id), { component_type: "Artifact", name: "map.json", content: "{ nope" })))?.fieldErrors["content"]).toEqual(["isn't valid JSON"]);
    await request("PUT", path(id), { component_type: "Artifact", name: "map.json", content: '{ "a": "b" }' });
  });

  it("lets a viewer read but not change them", async () => {
    const [first] = (await list()).data;
    signInAs("user-beth");
    await expect(list()).resolves.toBeTruthy();
    expect((await refusal(request("PUT", path(first!.id), { content: "{}" })))?.code).toBe("forbidden");
    expect((await refusal(request("DELETE", path(first!.id))))?.code).toBe("forbidden");
  });
});
