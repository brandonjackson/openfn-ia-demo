/** A project's published services: what the Services catalog, a service's page and a project's card show (the demo's own routes; api/ has no services yet, see docs/api-gaps.md). */
import type { ServiceRecord, XRoadConnectionStatus } from "./xroad";
import type { ChannelType } from "./channels";
import type { ConnectionMethod } from "./connected-systems";

export interface ProjectServiceItem {
  id: string;
  name: string;
  description: string;
  status: "Live" | "Draft";
  /** The workflow component that runs this service. */
  workflowId?: string;
  /** How other teams call the service. Generated from the workflow when absent. */
  api?: ServiceApiSpec;
  /** What the catalogue records about it: owner, purpose, legal basis and so on. */
  record?: ServiceRecord;
  /** Who uses it: how many organisations, and how many calls in the last 30 days. */
  usage?: { organisations: number; calls30d: number; trend?: number[] };
  /** Whether agents can call it as a tool on the organisation's MCP server. */
  mcpEnabled?: boolean;
  /** The tool's name on the organisation's MCP server, e.g. `client_registry_lookup`. */
  mcpToolName?: string;
  /** Its X-Road service code, once published to X-Road. */
  xroad?: { serviceCode: string; published: boolean; clients?: string[] };
}

export interface ServiceApiField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ServiceApiSpec {
  /**
   * `webhook` services are called over HTTP; `schedule` services run on a
   * timer and only publish what they produce.
   */
  trigger: "webhook" | "schedule";
  /** Webhook: `POST https://…`. Schedule: e.g. "Every 15 minutes". */
  invocation: string;
  /** How callers authenticate (webhook only). */
  auth?: string;
  /** Fields the caller sends (webhook only). */
  inputFields?: ServiceApiField[];
  /** A sample request, e.g. a curl command (webhook only). */
  requestExample?: string;
  /** What the service returns or publishes. */
  outputDescription: string;
  outputExample: string;
}

/** A published service's listing, as service.md in the code explorer. */
export function serviceListing(service: ProjectServiceItem): string {
  const api = service.api;
  const lines = [`# ${service.name}`, "", service.description, "", `Status: ${service.status}`];
  if (!api) return [...lines, "", "No API published yet. Publishing the service generates one from the workflow.", ""].join("\n");
  lines.push("", "## How to call it", api.trigger === "webhook" ? `\`${api.invocation}\`` : api.invocation);
  if (api.auth) lines.push("", `Auth: ${api.auth}`);
  if (api.inputFields?.length) {
    lines.push("", "## Input", "| Field | Type | Required | Description |", "| --- | --- | --- | --- |");
    for (const f of api.inputFields) lines.push(`| ${f.name} | ${f.type} | ${f.required ? "yes" : "no"} | ${f.description} |`);
  }
  if (api.requestExample) lines.push("", "## Example request", "```bash", api.requestExample, "```");
  lines.push("", "## Output", api.outputDescription, "", "```json", api.outputExample, "```", "");
  return lines.join("\n");
}

/** Where a webhook service is called, read from how it's invoked (`POST https://…`), if it says. */
export const serviceUrl = (service: ProjectServiceItem): string | undefined => service.api?.invocation.match(/https?:\/\/\S+/)?.[0];

/** Ways a published service can be used: as a step in another workflow, as an agent tool over MCP, or by other members over X-Road. */
export type ServiceConsumer = "workflow" | "mcp" | "xroad";

export interface ChannelCatalogEntry {
  kind: "channel";
  id: string;
  name: string;
  description: string;
  channelType: ChannelType;
  system: string;
  systemPath: string;
  section: string;
}

export interface WorkflowCatalogEntry {
  kind: "workflow";
  id: string;
  name: string;
  description: string;
  project: string;
  projectPath: string;
  badges?: string[];
  section: string;
  /** How the service can be called. Scheduled services run on their own and have none. */
  callableAs?: ServiceConsumer[];
  /** Tool name agents see on the organization's MCP server. */
  mcpToolName?: string;
  /** How many organisations use it, and how many calls it took in the last 30 days. */
  usage?: { organisations: number; calls30d: number };
}

/**
 * A service the organisation uses: one published by a system it has added,
 * such as another member's service on X-Road. Only systems you've added
 * show up.
 */
export interface UsedServiceEntry {
  id: string;
  name: string;
  description: string;
  /** The connected system it comes through. */
  system: string;
  systemPath: string;
  adaptor: string;
  connection: ConnectionMethod;
  xroadStatus?: XRoadConnectionStatus;
  /** The organisation that publishes it. */
  owner: string;
  /** The endpoints it offers. */
  methods: string[];
  /** Its X-Road service ID, e.g. `FJ/GOV/MOI/IDENTITY/verify-national-id`. */
  serviceId?: string;
  builtWithOpenFn?: boolean;
  record?: ServiceRecord;
}

export type CatalogEntry = ChannelCatalogEntry | WorkflowCatalogEntry;
