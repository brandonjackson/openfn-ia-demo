import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { apiWorkflowId } from "../fixtures/ids";
import type { WorkflowDocument } from "../model/workflow-document";
import { resetFakeApi, setWait, signInAs } from ".";
import { projectIdFor } from "./projects";

const a = projectIdFor("project-a");
const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Entry = { id: string; name?: string; attributes: Record<string, unknown> };

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("collections", () => {
  const list = () => request<{ data: { id: string; name: string; item_count: number }[] }>("GET", `/api/projects/${a}/collections`).then((r) => r.data);

  it("seeds one list per project from both fixture lists", async () => {
    expect((await list()).map((c) => c.name).sort()).toEqual(["applicant-cache", "authority-codes", "decision-sync.cursor", "planning-authority-codes"]);
  });

  it("makes, renames (keeping items) and deletes a collection", async () => {
    const id = crypto.randomUUID();
    expect((await refusal(request("PUT", `/api/projects/${a}/collections/${id}`, { name: "Bad Name" })))?.fieldErrors["name"]).toBeTruthy();
    expect((await refusal(request("PUT", `/api/projects/${a}/collections/${id}`, { name: "applicant-cache" })))?.fieldErrors["name"]).toEqual(["has already been taken"]);
    await request("PUT", `/api/projects/${a}/collections/${id}`, { name: "cursors" });
    await request("PUT", `/collections/cursors/last`, { value: '"2026-11-05"' });
    await request("PUT", `/api/projects/${a}/collections/${id}`, { name: "sync-cursors" });
    const { items } = await request<{ items: { key: string }[] }>("GET", "/collections/sync-cursors");
    expect(items.map((i) => i.key)).toEqual(["last"]);
    await request("DELETE", `/api/projects/${a}/collections/${id}`);
    expect((await list()).some((c) => c.id === id)).toBe(false);
    expect((await refusal(request("GET", "/collections/sync-cursors")))?.code).toBe("not_found");
  });

  it("keeps collection management to owners and admins, and hides items from outsiders", async () => {
    signInAs("user-john"); // an editor in project-a
    expect((await refusal(list()))?.code).toBe("forbidden");
    await expect(request("GET", `/collections/applicant-cache?project_id=${a}`)).resolves.toBeTruthy();
    // Its sandboxes have one of the same name, so a name alone doesn't say which.
    expect((await refusal(request("GET", "/collections/applicant-cache")))?.code).toBe("ambiguous_name");
    signInAs("user-grace"); // not in project-a
    expect((await refusal(request("GET", `/collections/applicant-cache?project_id=${a}`)))?.code).toBe("not_found");
  });
});

describe("webhook auth methods", () => {
  const list = () => request<{ data: Entry[] }>("GET", `/api/projects/${a}/webhook_auth_methods`).then((r) => r.data);

  it("shows a new API key once, and only its last characters after", async () => {
    const id = crypto.randomUUID();
    const made = await request<{ data: Entry }>("PUT", `/api/projects/${a}/webhook_auth_methods/${id}`, { name: "partner", auth_type: "api" });
    const key = made.data.attributes["api_key"] as string;
    expect(key).toHaveLength(64);
    const listed = (await list()).find((m) => m.id === id)!;
    expect(listed.attributes["api_key"]).toBeUndefined();
    expect(listed.attributes["api_key_last_characters"]).toBe(key.slice(-5));
  });

  it("needs a password of 8 or more for basic, and never changes its type", async () => {
    const id = crypto.randomUUID();
    const short = await refusal(request("PUT", `/api/projects/${a}/webhook_auth_methods/${id}`, { name: "b", auth_type: "basic", username: "u", password: "short" }));
    expect(short?.fieldErrors["password"]).toBeTruthy();
    await request("PUT", `/api/projects/${a}/webhook_auth_methods/${id}`, { name: "b", auth_type: "basic", username: "u", password: "long-enough" });
    const retype = await refusal(request("PUT", `/api/projects/${a}/webhook_auth_methods/${id}`, { name: "b", auth_type: "api" }));
    expect(retype?.fieldErrors["auth_type"]).toBeTruthy();
  });

  it("lists the triggers a method guards, and takes it off them when it's deleted", async () => {
    const portal = (await list()).find((m) => m.attributes["name"] === "e-planning portal")!;
    const planning = apiWorkflowId("planning-application-workflow");
    expect((portal.attributes["triggers"] as { workflow_id: string }[]).map((t) => t.workflow_id)).toContain(planning);
    await request("DELETE", `/api/projects/${a}/webhook_auth_methods/${portal.id}`);
    expect((await list()).some((m) => m.id === portal.id)).toBe(false);
    const { workflow } = await request<{ workflow: WorkflowDocument }>("GET", `/api/workflows/${planning}`);
    expect(workflow.triggers[0]!.webhook_auth_method_ids).not.toContain(portal.id);
    expect((await refusal(request("DELETE", `/api/projects/${a}/webhook_auth_methods/${portal.id}`)))?.code).toBe("scheduled_for_deletion");
  });
});

describe("history exports", () => {
  it("starts enqueued and is completed, with a file, a few seconds later", async () => {
    const made = await request<{ data: Entry }>("POST", `/api/projects/${a}/history_exports`, {});
    expect(made.data.attributes["state"]).toBe("enqueued");
    expect(made.data.attributes["download_url"]).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 3100));
    const { data } = await request<{ data: Entry }>("GET", `/api/projects/${a}/history_exports/${made.data.id}`);
    expect(data.attributes["state"]).toBe("completed");
    expect(data.attributes["filename"]).toMatch(/^project-a-history-.*\.json$/);
  }, 6000);

  it("lets a viewer list exports but not ask for one", async () => {
    signInAs("user-beth"); // a viewer in project-a
    await expect(request("GET", `/api/projects/${a}/history_exports`)).resolves.toBeTruthy();
    expect((await refusal(request("POST", `/api/projects/${a}/history_exports`, {})))?.code).toBe("forbidden");
  });
});
