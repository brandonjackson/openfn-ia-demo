/**
 * Adaptor specifiers (`@openfn/language-http@7.0.0`): parsing, display names
 * and the bundled icons. Pure: the catalogue and its versions are fixtures in
 * mock-data/adaptors.ts.
 */
import { capitalize } from "./format";

/** `@openfn/language-http@latest` → `{ package: "@openfn/language-http", version: "latest" }`. */
export function resolveAdaptor(specifier: string): { package: string; version: string } {
  const match = specifier.match(/^(@[^@]+|[^@]+)(?:@(.+))?$/);
  return { package: match?.[1] ?? specifier, version: match?.[2] ?? "latest" };
}

/** The same adaptor package at another version: `(…-http@7.0.0, "7.3.3")` → `…-http@7.3.3`. */
export function adaptorAtVersion(specifier: string, version: string): string {
  return `${resolveAdaptor(specifier).package}@${version}`;
}

/** A newly picked adaptor package, at `latest`. */
export function latestAdaptor(pkg: string): string {
  return `${pkg}@latest`;
}

/** `@openfn/language-http@latest` → `http` (Lightning's extractAdaptorName). */
export function adaptorShortName(specifier: string): string {
  return resolveAdaptor(specifier).package.replace(/^@openfn\/language-/, "");
}

/** `http` → `Http`, `googlesheets` → `Googlesheets` (Lightning's getAdaptorDisplayName). */
export function adaptorDisplayName(specifier: string): string {
  return capitalize(adaptorShortName(specifier));
}

/**
 * Adaptors we have a square icon for (public/images/adaptors/<id>-square.png),
 * downloaded from a local Lightning's /adaptors/icons/ (see the
 * compare-with-lightning skill).
 */
const ICONS = new Set([
  "arcgis",
  "asana",
  "aws-s3",
  "azure-storage",
  "beyonic",
  "bigquery",
  "cartodb",
  "chatgpt",
  "cht",
  "claude",
  "commcare",
  "common",
  "dhis2",
  "divoc",
  "dynamics",
  "erpnext",
  "facebook",
  "fhir",
  "flutterwave",
  "gemini",
  "gmail",
  "godata",
  "googledrive",
  "googlehealthcare",
  "googlesheets",
  "http",
  "ihris",
  "khanacademy",
  "kobotoolbox",
  "magpi",
  "mailchimp",
  "mailgun",
  "maximo",
  "medicmobile",
  "mongodb",
  "mpesa",
  "msgraph",
  "mssql",
  "mysql",
  "odk",
  "odoo",
  "opencrvs",
  "openelis",
  "openhim",
  "openimis",
  "openlmis",
  "openmrs",
  "openspp",
  "postgresql",
  "primero",
  "rapidpro",
  "redis",
  "salesforce",
  "satusehat",
  "sftp",
  "stripe",
  "surveycto",
  "telerivet",
  "twilio",
  "vtiger",
  "whatsapp",
  "zoho",
]);

export function adaptorIconUrl(specifier: string): string | null {
  const short = adaptorShortName(specifier);
  return ICONS.has(short) ? `${import.meta.env.BASE_URL}images/adaptors/${short}-square.png` : null;
}
