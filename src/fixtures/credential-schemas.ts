import type { CredentialSchema } from "../model/page-data";

/**
 * The kinds of credential the type picker offers. Fields, labels and which
 * are required come from each adaptor's configuration schema (Lightning
 * reads them from the adaptors' `configuration-schema.json`); raw JSON takes
 * any body at all.
 */
export const credentialSchemas: CredentialSchema[] = [
  {
    id: "http",
    name: "HTTP",
    adaptor: "http",
    description: "Any REST API, with basic auth or a bearer token",
    fields: [
      { key: "baseUrl", label: "Base URL", kind: "url", description: "The base URL (http://www.example.com)", placeholder: "https://instance_name.surveycto.com" },
      { key: "username", label: "Username", kind: "text", placeholder: "test@openfn.org" },
      { key: "password", label: "Password", kind: "secret" },
      { key: "access_token", label: "Access token", kind: "secret", description: "OAuth access token, API key or other bearer token" },
    ],
  },
  {
    id: "dhis2",
    name: "DHIS2",
    adaptor: "dhis2",
    description: "District Health Information System",
    fields: [
      { key: "hostUrl", label: "Host URL", kind: "url", description: "The destination server URL", placeholder: "https://play.im.dhis2.org/stable-2-41-1", required: true },
      { key: "username", label: "Username", kind: "text", description: "The username used to log in", required: true },
      { key: "password", label: "Password", kind: "secret", description: "The password used to log in", required: true },
      { key: "apiVersion", label: "API version", kind: "text", description: "The DHIS2 API version to use", placeholder: "41" },
    ],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    adaptor: "salesforce",
    description: "CRM, with a username, password and security token",
    fields: [
      { key: "loginUrl", label: "Login URL", kind: "url", description: "Use test.salesforce.com for a sandbox org", placeholder: "https://login.salesforce.com", required: true },
      { key: "username", label: "Username", kind: "text", required: true },
      { key: "password", label: "Password", kind: "secret", required: true },
      { key: "securityToken", label: "Security token", kind: "secret", description: "Sent to you by Salesforce when you reset your token" },
    ],
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    adaptor: "postgresql",
    description: "A Postgres database",
    fields: [
      { key: "host", label: "Host", kind: "text", description: "Postgres instance host URL or IP address", placeholder: "https://some-host.compute-1.amazonaws.com", required: true },
      { key: "port", label: "Port", kind: "number", description: "Database instance port", defaultValue: "5432", required: true },
      { key: "database", label: "Database", kind: "text", description: "The database name", placeholder: "demo-db", required: true },
      { key: "user", label: "User", kind: "text", placeholder: "admin" },
      { key: "password", label: "Password", kind: "secret" },
      { key: "ssl", label: "Use SSL", kind: "boolean" },
      { key: "allowSelfSignedCert", label: "Allow self-signed certificate", kind: "boolean" },
    ],
  },
  {
    id: "commcare",
    name: "CommCare",
    adaptor: "commcare",
    description: "Mobile data collection for frontline workers",
    fields: [
      { key: "hostUrl", label: "Host URL", kind: "url", placeholder: "https://www.commcarehq.org", required: true },
      { key: "domain", label: "Project space", kind: "text", description: "The CommCare project space (domain)", required: true },
      { key: "username", label: "Username", kind: "text", required: true },
      { key: "apiKey", label: "API key", kind: "secret", required: true },
      { key: "appId", label: "App ID", kind: "text", description: "Only needed to submit forms" },
    ],
  },
  {
    id: "googlesheets",
    name: "Google Sheets",
    adaptor: "googlesheets",
    description: "Cloud spreadsheets, with an access token",
    fields: [{ key: "access_token", label: "Access token", kind: "secret", description: "Your Google Sheets access token", required: true }],
  },
  {
    id: "raw",
    name: "Raw JSON",
    description: "Any body at all, for adaptors without a schema",
    fields: [{ key: "body", label: "Credential body", kind: "json", required: true, defaultValue: "{}" }],
  },
];
