/** A project's published services: what the Services catalog, a service's page and a project's card show (the demo's own routes; api/ has no services yet, see docs/api-gaps.md). */
import type { ServiceRecord } from "./xroad";

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
