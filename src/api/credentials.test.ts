import { beforeEach, describe, expect, it } from "vitest";
import { credentialSchemas } from "../fixtures/credential-schemas";
import { resetFakeApi, setWait } from "../fake-api";
import { forgetCsrfToken, request } from "./client";
import { schemaIdOf, toCredentialSchema, type ApiCredentialSchema } from "./credentials";

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("credential schemas, read into the form's fields", () => {
  it("reads every schema the server sends back into the fields it was made from", async () => {
    const { data: list } = await request<{ data: { name: string }[] }>("GET", "/api/credential_schemas");
    const read = await Promise.all(
      list.map(async ({ name }) => toCredentialSchema((await request<{ data: ApiCredentialSchema }>("GET", `/api/credential_schemas/${encodeURIComponent(name)}`)).data)),
    );
    expect(read).toEqual(credentialSchemas);
  });

  it("takes an adaptor whose schema has no properties as any JSON body, under its own name", () => {
    const empty = toCredentialSchema({ name: "@openfn/language-fhir", title: "FHIR", schema: {} });
    expect(empty).toMatchObject({ id: "fhir", adaptor: "fhir", name: "FHIR", fields: [{ key: "body", kind: "json" }] });
  });

  it("writes defaults and examples that aren't text as JSON", () => {
    const schema = toCredentialSchema({
      name: "@openfn/language-x",
      title: "X",
      schema: { properties: { headers: { type: "object", title: "Headers", default: { accept: "json" }, examples: [["a"]] } } },
    });
    expect(schema.fields[0]).toMatchObject({ kind: "json", defaultValue: '{"accept":"json"}', placeholder: '["a"]' });
  });

  it("stores a credential's schema in full and reads it back by the short name the form knows", async () => {
    const made = await request<{ credential: { id: string; schema: string } }>("POST", "/api/credentials", {
      name: "Ministry DHIS2",
      schema: "dhis2",
      credential_bodies: [{ name: "production", body: { hostUrl: "https://dhis2.example.org" } }],
    });
    expect(made.credential.schema).toBe("@openfn/language-dhis2");
    expect(schemaIdOf(made.credential.schema)).toBe("dhis2");
  });
});
