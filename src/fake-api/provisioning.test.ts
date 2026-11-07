import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, getFile, request, type ApiError } from "../api/client";
import { resetFakeApi, setWait, signInAs } from ".";
import { projectIdFor } from "./projects";

const a = projectIdFor("project-a");
const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Export = { id: string; attributes: { state: string; download_url: string | null } };

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("exporting a project as YAML", () => {
  it("answers the project, its collections and its workflows as YAML", async () => {
    const { workflows } = await request<{ workflows: { name: string; jobs: { name: string }[] }[] }>("GET", `/api/projects/${a}/workflows`);
    const file = await getFile(`/api/provision/yaml?id=${a}`);
    expect(file.type).toBe("text/yaml");
    const yaml = await file.text();
    expect(yaml).toMatch(/^name: /);
    expect(yaml).toContain("collections:");
    expect(yaml).toContain(`    name: ${workflows[0]!.name}`);
    expect(yaml).toContain(`        name: ${workflows[0]!.jobs[0]!.name}`);
  });

  it("names the query parameter when the id is missing or isn't a UUID", async () => {
    expect((await refusal(getFile("/api/provision/yaml")))?.errors[0]).toMatchObject({ code: "required", parameter: "id" });
    expect((await refusal(getFile("/api/provision/yaml?id=project-a")))?.errors[0]).toMatchObject({ code: "type", parameter: "id" });
  });

  it("refuses an id that isn't a UUID as forbidden to anyone but a superuser", async () => {
    signInAs("user-john"); // an editor in project-a
    expect((await refusal(getFile("/api/provision/yaml?id=project-a")))?.code).toBe("forbidden");
  });

  it("refuses anyone who isn't a member", async () => {
    signInAs("user-priya"); // not in project-a
    expect((await refusal(getFile(`/api/provision/yaml?id=${a}`)))?.code).toBe("forbidden");
  });
});

describe("downloading a history export", () => {
  it("serves a finished export's file at its download_url, and nothing before it's done", async () => {
    const { data } = await request<{ data: Export[] }>("GET", `/api/projects/${a}/history_exports`);
    const done = data.find((e) => e.attributes.state === "completed")!;
    const file = JSON.parse(await (await getFile(done.attributes.download_url!)).text()) as { work_orders: { id: string }[] };
    expect(file.work_orders.length).toBeGreaterThan(0);

    const made = await request<{ data: Export }>("POST", `/api/projects/${a}/history_exports`, {});
    expect(made.data.attributes.download_url).toBeNull();
    expect((await refusal(getFile(`/api/projects/${a}/history_exports/${made.data.id}/download`)))?.code).toBe("not_found");
  });
});
