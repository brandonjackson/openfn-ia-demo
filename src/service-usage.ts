import type { ProjectServiceItem, ServiceApiSpec } from "./page-data";

/** The tool name agents see for a service, e.g. `client_registry_lookup`. */
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
