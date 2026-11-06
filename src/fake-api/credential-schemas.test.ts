import { beforeEach, describe, expect, it } from "vitest";
import { ApiError, forgetCsrfToken, request } from "../api/client";
import { resetFakeApi, setWait } from ".";

type Schema = { name: string; title: string; schema?: { properties: Record<string, { writeOnly?: boolean; format?: string }>; required: string[] } };

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("credential schemas", () => {
  it("lists every kind of credential by package name, raw included", async () => {
    const { data } = await request<{ data: { name: string; title: string }[] }>("GET", "/api/credential_schemas");
    expect(data).toContainEqual({ name: "@openfn/language-dhis2", title: "DHIS2" });
    expect(data).toContainEqual({ name: "raw", title: "Raw JSON" });
  });

  it("answers a schema by its full or short name, with secrets write-only and required fields listed", async () => {
    const full = await request<{ data: Schema }>("GET", `/api/credential_schemas/${encodeURIComponent("@openfn/language-dhis2")}`);
    const short = await request<{ data: Schema }>("GET", "/api/credential_schemas/dhis2");
    expect(short).toEqual(full);
    const { properties, required } = full.data.schema!;
    expect(properties["password"]?.writeOnly).toBe(true);
    expect(properties["hostUrl"]?.format).toBe("uri");
    expect(required).toEqual(expect.arrayContaining(["hostUrl", "username", "password"]));
  });

  it("sends raw with no schema, and refuses a name it doesn't know", async () => {
    const raw = await request<{ data: Schema }>("GET", "/api/credential_schemas/raw");
    expect(raw.data).toEqual({ name: "raw", title: "Raw JSON" });
    const refusal = await request("GET", "/api/credential_schemas/not-an-adaptor").catch((e: unknown) => e as ApiError);
    expect((refusal as ApiError).code).toBe("not_found");
  });
});
