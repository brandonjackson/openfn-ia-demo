import { beforeEach, describe, expect, it } from "vitest";
import { ApiError, forgetCsrfToken, request } from "../api/client";
import { apiWorkflowId } from "../fixtures/ids";
import { resetFakeApi, setWait } from ".";
import { projectIdFor } from "./projects";

const a = projectIdFor("project-a");
const workflowId = apiWorkflowId("apply-national-id");
const path = `/api/demo/projects/${a}/workflow_docs`;

type Doc = { id: string; attributes: { name: string; content: string } };
const list = () => request<{ data: Doc[] }>("GET", `${path}?workflow_id=${workflowId}`).then((r) => r.data);
const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => (e instanceof ApiError ? e : undefined));

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("a workflow's docs", () => {
  it("are seeded with context.md and spec.md", async () => {
    expect((await list()).map((d) => d.attributes.name)).toEqual(["context.md", "spec.md"]);
  });

  it("are made, changed and deleted, each name once per workflow and ending in .md", async () => {
    const made = await request<{ data: Doc }>("POST", path, { workflow_id: workflowId, name: "runbook.md", content: "# Runbook" });
    expect(made.data.attributes.content).toBe("# Runbook");

    expect((await refusal(request("POST", path, { workflow_id: workflowId, name: "Runbook.md" })))?.status).toBe(422);
    expect((await refusal(request("POST", path, { workflow_id: workflowId, name: "notes.txt" })))?.status).toBe(422);

    await request("PATCH", `${path}/${made.data.id}`, { content: "# Runbook\n\nUpdated." });
    expect((await list()).find((d) => d.id === made.data.id)?.attributes.content).toBe("# Runbook\n\nUpdated.");

    await request("DELETE", `${path}/${made.data.id}`);
    expect((await list()).some((d) => d.id === made.data.id)).toBe(false);
  });
});
