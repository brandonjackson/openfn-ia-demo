import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { resetFakeApi, setWait, signInAs } from ".";
import { projectIdFor } from "./projects";

const a = projectIdFor("project-a");
const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Var = { id: string; attributes: { key: string; value: string | null; secret: boolean; environments: string[] } };
const base = `/api/demo/projects/${a}/env_vars`;
const list = () => request<{ data: Var[] }>("GET", `${base}?page_size=100`).then((r) => r.data);
const make = (body: Record<string, unknown>) => request<{ data: Var }>("POST", base, body).then((r) => r.data);

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("environment variables", () => {
  it("lists a project's variables by key, never sending a secret's value", async () => {
    const vars = await list();
    expect(vars.map((v) => v.attributes.key)).toEqual([...vars.map((v) => v.attributes.key)].sort());
    const secrets = vars.filter((v) => v.attributes.secret);
    expect(secrets.length).toBeGreaterThan(0);
    expect(secrets.every((v) => v.attributes.value === null)).toBe(true);
  });

  it("makes, changes and deletes one", async () => {
    const made = await make({ key: "TIMEOUT_MS", value: "3000", environments: ["staging", "production"] });
    expect(made.attributes).toMatchObject({ key: "TIMEOUT_MS", value: "3000", secret: false, environments: ["production", "staging"] });
    const changed = await request<{ data: Var }>("PATCH", `${base}/${made.id}`, { value: "5000", environments: ["mock"] });
    expect(changed.data.attributes).toMatchObject({ value: "5000", environments: ["mock"] });
    await request("DELETE", `${base}/${made.id}`);
    expect((await list()).some((v) => v.id === made.id)).toBe(false);
  });

  it("sets a key once in each environment, so it can hold other values elsewhere", async () => {
    await make({ key: "REGION", value: "eu", environments: ["production"] });
    await make({ key: "REGION", value: "us", environments: ["staging", "mock"] });
    const taken = await refusal(make({ key: "REGION", value: "af", environments: ["mock"] }));
    expect(taken?.fieldErrors["key"]).toEqual(["is already set in mock"]);
  });

  it("checks the key, the value and the environments", async () => {
    const bad = await refusal(make({ key: "1-BAD", value: "", environments: [] }));
    expect(Object.keys(bad?.fieldErrors ?? {}).sort()).toEqual(["environments", "key", "value"]);
    expect((await refusal(make({ key: "OK", value: "x", environments: ["preview"] })))?.fieldErrors["environments"]).toBeTruthy();
  });

  it("keeps a secret's value when it's left blank, and keeps it secret", async () => {
    const made = await make({ key: "TOKEN", value: "s3cret", secret: true, environments: ["production"] });
    expect(made.attributes.value).toBeNull();
    const renamed = await request<{ data: Var }>("PATCH", `${base}/${made.id}`, { key: "API_TOKEN", value: "" });
    expect(renamed.data.attributes).toMatchObject({ key: "API_TOKEN", secret: true, value: null });
    expect((await refusal(request("PATCH", `${base}/${made.id}`, { secret: false })))?.fieldErrors["secret"]).toBeTruthy();
    // A plain one can become secret.
    const plain = await make({ key: "PLAIN", value: "x", environments: ["mock"] });
    const hidden = await request<{ data: Var }>("PATCH", `${base}/${plain.id}`, { secret: true });
    expect(hidden.data.attributes.value).toBeNull();
  });

  it("lets a viewer read them but not change them", async () => {
    const [first] = await list();
    signInAs("user-beth");
    await expect(list()).resolves.toBeTruthy();
    expect((await refusal(make({ key: "X", value: "1", environments: ["mock"] })))?.code).toBe("forbidden");
    expect((await refusal(request("DELETE", `${base}/${first!.id}`)))?.code).toBe("forbidden");
  });
});
