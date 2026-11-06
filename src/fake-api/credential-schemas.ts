/**
 * Credential schemas on the pretend server (api/credentials.md, "Credential
 * schemas"): the kinds of credential you can make, each named by its
 * adaptor's package, with a JSON Schema for its body. `raw` takes any body,
 * so it has none. Built from the type picker's fixtures, whose fields are
 * turned into the JSON Schema an adaptor's `configuration-schema.json` holds.
 */
import { credentialSchemas } from "../fixtures/credential-schemas";
import type { CredentialField, CredentialSchema } from "../model/credentials";
import { json, notFound, type Handler } from "./answers";

/** A schema's name on the API: its adaptor's package, or `raw`. */
const nameOf = (s: CredentialSchema) => (s.adaptor ? `@openfn/language-${s.adaptor}` : s.id);

/** A schema named in full, as it's stored: short names (`dhis2`) are accepted and stored as their package. */
export const fullSchemaName = (name: string) => (name === "raw" || name.startsWith("@") ? name : `@openfn/language-${name}`);

/** The fixture schema a full or short name names, if the picker has one. */
export const findSchema = (name: string) => credentialSchemas.find((s) => nameOf(s) === fullSchemaName(name));

/** One field as a JSON Schema property, in the words adaptors' configuration schemas use. */
function property(f: CredentialField): Record<string, unknown> {
  const type = { text: "string", url: "string", secret: "string", number: "number", boolean: "boolean", json: "object" }[f.kind];
  return {
    type,
    title: f.label,
    ...(f.description && { description: f.description }),
    ...(f.kind === "url" && { format: "uri" }),
    ...(f.kind === "secret" && { writeOnly: true }),
    ...(f.placeholder && { examples: [f.placeholder] }),
    ...(f.defaultValue !== undefined && { default: f.kind === "number" ? Number(f.defaultValue) : f.kind === "boolean" ? f.defaultValue === "true" : f.defaultValue }),
  };
}

function jsonSchema(s: CredentialSchema) {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    description: s.description,
    properties: Object.fromEntries(s.fields.map((f) => [f.key, property(f)])),
    required: s.fields.filter((f) => f.required).map((f) => f.key),
  };
}

export const credentialSchemaRoutes: Record<string, Handler> = {
  "GET /api/credential_schemas": () => json(200, { data: credentialSchemas.map((s) => ({ name: nameOf(s), title: s.name })) }),
  "GET /api/credential_schemas/:name": ({ name }) => {
    const s = findSchema(name!);
    if (!s) return notFound();
    return json(200, { data: { name: nameOf(s), title: s.name, ...(s.adaptor && { schema: jsonSchema(s) }) } });
  },
};
