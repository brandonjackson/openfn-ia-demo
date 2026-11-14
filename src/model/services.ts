/** A project's published services: what the Services catalog, a service's page and a project's card show (the demo's own routes; api/ has no services yet, see docs/api-gaps.md). */
import { clientIdOf, type ServiceRecord, type XRoadConnectionStatus, type XRoadIdentity } from "./xroad";
import type { ChannelType } from "./channels";
import type { ConnectionMethod } from "./connected-systems";

export interface ProjectServiceItem {
  id: string;
  name: string;
  description: string;
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

/** A YAML scalar: plain when it reads back the same, double-quoted (which JSON's quoting is) otherwise. */
function yamlScalar(value: string | number | boolean): string {
  if (typeof value !== "string") return String(value);
  const plain = /^[A-Za-z0-9_/(][^#]*$/.test(value) && !/:\s|:$|\s$/.test(value) && !/^(true|false|null|yes|no|on|off|~|[-+]?[\d.]+)$/i.test(value);
  return plain ? value : JSON.stringify(value);
}

/** `key: value` at an indent, a block scalar (`|`) for text over several lines. */
function yamlField(indent: number, key: string, value: string | number | boolean): string[] {
  const pad = " ".repeat(indent);
  if (typeof value === "string" && value.includes("\n")) return [`${pad}${key}: |`, ...value.split("\n").map((l) => (l ? `${pad}  ${l}` : ""))];
  return [`${pad}${key}: ${yamlScalar(value)}`];
}

/** `FJ:GOV:MOH:OPENFN`: a client or subsystem id as the Security Server's API writes it, from the demo's `FJ/GOV/MOH/OPENFN`. */
const securityServerId = (id: string) => id.replaceAll("/", ":");

/**
 * A published service's listing, as service.yaml in the code explorer: what
 * the service catalog records about it, then, once the organisation is on
 * X-Road, the service as the Security Server registers it, under the
 * Security Server's own field names (a REST service description, its one
 * service with its URL, timeout, TLS check and endpoint, and who has access
 * to it), and last how to call it. A scheduled service has no address to
 * call, so it has no `x_road` part.
 */
export function serviceYaml(service: ProjectServiceItem, { code, xroad }: { code: string; xroad?: XRoadIdentity }): string {
  const api = service.api;
  const record = service.record;
  const lines = [
    `# service.yaml: how ${service.name} is listed in the service catalog${xroad ? " and on X-Road" : ""}.`,
    ...yamlField(0, "name", service.name),
    ...yamlField(0, "description", service.description),
  ];
  if (record) {
    lines.push(
      ...yamlField(0, "version", record.version),
      "catalog:",
      ...yamlField(2, "owner", record.owner),
      ...yamlField(2, "purpose", record.purpose),
      ...yamlField(2, "data_exchanged", record.dataExchanged),
      ...yamlField(2, "legal_basis", record.legalBasis),
      `  classification: ${record.classification.toLowerCase()}`,
      ...yamlField(2, "sla", record.sla),
      ...yamlField(2, "access_conditions", record.accessConditions),
    );
  }
  if (service.mcpEnabled !== undefined || service.mcpToolName) {
    lines.push("mcp:", `  enabled: ${Boolean(service.mcpEnabled)}`);
    if (service.mcpToolName) lines.push(`  tool_name: ${yamlScalar(service.mcpToolName)}`);
  }

  const url = serviceUrl(service);
  if (xroad && url) {
    const serviceCode = service.xroad?.serviceCode ?? code;
    const method = api?.invocation.match(/^([A-Z]+)\s/)?.[1] ?? "POST";
    const clients = service.xroad?.clients ?? [];
    lines.push(
      "x_road:",
      `  published: ${Boolean(service.xroad?.published)}`,
      "  # The subsystem OpenFn publishes as: instance, member class, member code, subsystem.",
      `  client_id: ${securityServerId(clientIdOf(xroad))}`,
      "  service_description:",
      "    type: REST",
      `    url: ${yamlScalar(url)}`,
      `    rest_service_code: ${yamlScalar(serviceCode)}`,
      "    disabled: false",
      "  services:",
      `    - service_code: ${yamlScalar(serviceCode)}`,
      ...yamlField(6, "title", service.name),
      `      url: ${yamlScalar(url)}`,
      "      timeout: 60",
      `      ssl_auth: ${url.startsWith("https:")}`,
      "      endpoints:",
      `        - method: ${method}`,
      `          path: /`,
      clients.length ? "  access_rights:" : "  access_rights: []",
      ...clients.flatMap((id) => [`    - id: ${securityServerId(id)}`, "      service_client_type: SUBSYSTEM"]),
    );
  }

  if (!api) return [...lines, "# No API yet: publishing the service generates one from the workflow.", ""].join("\n");
  lines.push("api:", `  trigger: ${api.trigger}`);
  if (api.trigger === "webhook" && url) {
    lines.push(`  method: ${api.invocation.match(/^([A-Z]+)\s/)?.[1] ?? "POST"}`, `  url: ${yamlScalar(url)}`);
  } else {
    lines.push(...yamlField(2, "schedule", api.invocation));
  }
  if (api.auth) lines.push(...yamlField(2, "auth", api.auth));
  if (api.inputFields?.length) {
    lines.push("  input:");
    for (const f of api.inputFields) {
      lines.push(`    - name: ${yamlScalar(f.name)}`, `      type: ${yamlScalar(f.type)}`, `      required: ${f.required}`, ...yamlField(6, "description", f.description));
    }
  }
  if (api.requestExample) lines.push(...yamlField(2, "request_example", api.requestExample));
  lines.push("  output:", ...yamlField(4, "description", api.outputDescription), ...yamlField(4, "example", api.outputExample), "");
  return lines.join("\n");
}

/**
 * A service.yaml for a workflow that isn't published as a service yet: the
 * fields its listing will have, to fill in before it's published.
 */
export function draftServiceManifest(workflowName: string): string {
  return [
    `# service.yaml: how ${workflowName} will be listed in the service catalog once it's published.`,
    ...yamlField(0, "name", workflowName),
    'description: ""',
    "api:",
    "  trigger: webhook",
    "  input: []",
    "  output:",
    '    description: ""',
    "",
  ].join("\n");
}

/** Where a webhook service is called, read from how it's invoked (`POST https://…`), if it says. */
export const serviceUrl = (service: ProjectServiceItem): string | undefined => service.api?.invocation.match(/https?:\/\/\S+/)?.[0];

/** A Live service a workflow step can call, with who offers it (its section, or its project's name). */
export interface StepService extends ProjectServiceItem {
  offeredBy: string;
}

/** Whether a step can call the service: it's called over HTTP (a scheduled service has no address). */
export const isCallableFromStep = (service: ProjectServiceItem): boolean => service.api?.trigger === "webhook" && !!serviceUrl(service);

const identifier = /^[A-Za-z_$][\w$]*$/;
/** A property name as JavaScript writes it in an object, quoted when it has to be. */
const jsKey = (name: string) => (identifier.test(name) ? name : JSON.stringify(name));
/** Reading a field of the incoming data by name. */
const fromData = (name: string) => (identifier.test(name) ? `$.data.${name}` : `$.data[${JSON.stringify(name)}]`);

/**
 * The starting code of a step that calls a service: an HTTP request to its
 * address with a body of its input fields, each read from the same name on
 * the incoming data and noted with its type and what it is, then what the
 * service answers with.
 */
export function serviceStepBody(service: StepService): string {
  const api = service.api;
  const url = serviceUrl(service) ?? "";
  const method = (api?.invocation.match(/^([A-Z]+)\s/)?.[1] ?? "POST").toLowerCase();
  const fields = api?.inputFields ?? [];
  const lines = [`// ${service.name}: a service from ${service.offeredBy}.`];
  if (api?.auth) lines.push(`// Authentication: ${api.auth}. Pick the credential that holds it.`);
  if (api?.outputDescription) lines.push(`// ${api.outputDescription}`);
  if (method === "get" || method === "delete") {
    lines.push(`${method}('${url}');`, "");
    return lines.join("\n");
  }
  if (!fields.length) {
    lines.push(`${method}('${url}', $.data);`, "");
    return lines.join("\n");
  }
  lines.push(`${method}('${url}', {`);
  for (const f of fields) {
    lines.push(`  // ${f.type}${f.required ? ", required" : ""}: ${f.description}`, `  ${jsKey(f.name)}: ${fromData(f.name)},`);
  }
  lines.push("});", "");
  return lines.join("\n");
}

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
