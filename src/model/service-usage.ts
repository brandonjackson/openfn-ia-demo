/** The tool name agents see for a service, e.g. `client_registry_lookup`. */
import type { ProjectServiceItem, ServiceApiSpec } from "./page-data";
export function mcpToolName(service: ProjectServiceItem): string {
  return service.id.replace(/-/g, "_");
}

function sampleValue(name: string, type: string): string {
  if (type.endsWith("[]")) return "[]";
  if (type === "object") return "{ … }";
  if (type === "number") return "0";
  if (type === "boolean") return "true";
  return `$.data.${name}`;
}

/** A job snippet that calls the service as a step in another workflow. */
export function workflowCallSnippet(projectId: string, service: ProjectServiceItem, api: ServiceApiSpec): string {
  const fields = (api.inputFields ?? []).filter((f) => f.required);
  const body = fields.length
    ? `{\n${fields.map((f) => `  ${f.name}: ${sampleValue(f.name, f.type)},`).join("\n")}\n}`
    : "{ … }";
  return `// In any job in your organization
callService('${projectId}/${service.id}', ${body});

// The response lands on state for the next step
fn(state => {
  console.log(state.data);
  return state;
});`;
}

/** The tool definition an agent gets from the organization's MCP server, one property per line. */
export function mcpToolSnippet(service: ProjectServiceItem, api: ServiceApiSpec): string {
  const fields = api.inputFields ?? [];
  const properties = fields
    .map((f) => {
      const type = f.type.endsWith("[]") ? "array" : f.type;
      return `      ${JSON.stringify(f.name)}: { "type": "${type}", "description": ${JSON.stringify(f.description)} }`;
    })
    .join(",\n");
  const required = fields.filter((f) => f.required).map((f) => JSON.stringify(f.name));
  return `{
  "name": "${mcpToolName(service)}",
  "description": ${JSON.stringify(service.description)},
  "inputSchema": {
    "type": "object",
    "properties": {
${properties}
    },
    "required": [${required.join(", ")}]
  }
}`;
}

/** The URL that starts a webhook service, from its invocation line. */
export function webhookUrl(api: ServiceApiSpec): string | undefined {
  return api.invocation.match(/https?:\/\/\S+/)?.[0];
}

/** Where the OpenAPI 3 document generated from the webhook trigger's annotations is served. */
export function openApiUrl(api: ServiceApiSpec): string | undefined {
  const url = webhookUrl(api);
  return url && `${url}/openapi.json`;
}

/**
 * What a workflow published over X-Road sees about who called it: structured
 * and read-only on `state.xroad`, never raw headers, for access checks and
 * audit.
 */
export const xroadCallerSnippet = `// On every run started over X-Road (read-only)
state.xroad = {
  client: {
    instance: "FJ",
    memberClass: "GOV",
    memberCode: "NRH",
    subsystem: "OPENMRS",
    name: "National Referral Hospital",
  },
  messageId: "nrh-5f1c0a2e-93b4-4d1e-8c2a", // X-Road-Id
  userId: "FJ-HW-20431",                    // X-Road-UserId, when sent
  issue: "CASE-2026-1182",                  // X-Road-Issue, when sent
};`;
