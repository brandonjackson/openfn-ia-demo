/**
 * Adaptors for the workflow editor: the catalogue shown in the adaptor
 * picker, the square icons Lightning serves for each one (copied into
 * public/images/adaptors/), and the docs shown in the IDE's Docs panel.
 * Static fixtures only.
 */

export interface Adaptor {
  id: string;
  name: string;
  description: string;
  category: string;
}

/**
 * OpenFn supported adaptors list.
 * Source: https://docs.openfn.org/adaptors
 */
export const adaptors: Adaptor[] = [
  { id: "arcgis", name: "ArcGIS", description: "Geospatial data and mapping", category: "GIS & Mapping" },
  { id: "asana", name: "Asana", description: "Project and task management", category: "Productivity" },
  { id: "aws-s3", name: "AWS S3", description: "Amazon cloud storage", category: "Cloud Storage" },
  { id: "azure-storage", name: "Azure Storage", description: "Microsoft Azure cloud storage", category: "Cloud Storage" },
  { id: "beyonic", name: "Beyonic", description: "Mobile money and payments", category: "Payments" },
  { id: "bigquery", name: "BigQuery", description: "Google data warehouse and analytics", category: "Data & Analytics" },
  { id: "cartodb", name: "CartoDB", description: "Location intelligence and mapping", category: "GIS & Mapping" },
  { id: "chatgpt", name: "ChatGPT", description: "OpenAI conversational AI", category: "AI & ML" },
  { id: "cht", name: "Community Health Toolkit", description: "Community health platform", category: "Health" },
  { id: "claude", name: "Claude", description: "Anthropic AI assistant", category: "AI & ML" },
  { id: "commcare", name: "CommCare", description: "Mobile data collection for frontline workers", category: "Data Collection" },
  { id: "dhis2", name: "DHIS2", description: "District Health Information System", category: "Health" },
  { id: "divoc", name: "DIVOC", description: "Digital vaccination certificates", category: "Health" },
  { id: "dynamics", name: "Microsoft Dynamics", description: "CRM and ERP platform", category: "CRM & ERP" },
  { id: "erpnext", name: "ERPNext", description: "Open-source ERP system", category: "CRM & ERP" },
  { id: "facebook", name: "Facebook", description: "Meta social platform", category: "Social & Messaging" },
  { id: "fhir", name: "FHIR", description: "Healthcare interoperability resources", category: "Health" },
  { id: "flutterwave", name: "Flutterwave", description: "African payment processing", category: "Payments" },
  { id: "gemini", name: "Gemini", description: "Google AI model", category: "AI & ML" },
  { id: "gmail", name: "Gmail", description: "Google email service", category: "Communication" },
  { id: "godata", name: "Go.Data", description: "Disease surveillance platform", category: "Health" },
  { id: "googledrive", name: "Google Drive", description: "Cloud file storage", category: "Cloud Storage" },
  { id: "googlehealthcare", name: "Google Healthcare", description: "Google Cloud Healthcare API", category: "Health" },
  { id: "googlesheets", name: "Google Sheets", description: "Cloud spreadsheet service", category: "Productivity" },
  { id: "http", name: "HTTP", description: "Generic REST API requests", category: "General" },
  { id: "ihris", name: "iHRIS", description: "Human resources for health", category: "Health" },
  { id: "khanacademy", name: "Khan Academy", description: "Educational content platform", category: "Education" },
  { id: "kobotoolbox", name: "KoBoToolbox", description: "Survey and data collection", category: "Data Collection" },
  { id: "magpi", name: "Magpi", description: "Mobile data collection", category: "Data Collection" },
  { id: "mailchimp", name: "Mailchimp", description: "Email marketing platform", category: "Communication" },
  { id: "mailgun", name: "Mailgun", description: "Email sending and management", category: "Communication" },
  { id: "maximo", name: "Maximo", description: "Asset and maintenance management", category: "Operations" },
  { id: "medicmobile", name: "Medic Mobile", description: "Community health worker platform", category: "Health" },
  { id: "mongodb", name: "MongoDB", description: "NoSQL document database", category: "Databases" },
  { id: "moodle", name: "Moodle", description: "Learning management system", category: "Education" },
  { id: "mpesa", name: "M-Pesa", description: "Mobile money service", category: "Payments" },
  { id: "msgraph", name: "Microsoft Graph", description: "Microsoft 365 API integration", category: "Productivity" },
  { id: "mssql", name: "Microsoft SQL Server", description: "Relational database", category: "Databases" },
  { id: "mysql", name: "MySQL", description: "Open-source relational database", category: "Databases" },
  { id: "odk", name: "ODK", description: "Open Data Kit form collection", category: "Data Collection" },
  { id: "odoo", name: "Odoo", description: "Open-source ERP and CRM", category: "CRM & ERP" },
  { id: "ona", name: "Ona", description: "Data collection and analytics", category: "Data Collection" },
  { id: "opencrvs", name: "OpenCRVS", description: "Civil registration system", category: "Government" },
  { id: "openelis", name: "OpenELIS", description: "Laboratory management system", category: "Health" },
  { id: "openhim", name: "OpenHIM", description: "Health interoperability middleware", category: "Health" },
  { id: "openimis", name: "openIMIS", description: "Social health protection", category: "Health" },
  { id: "openlmis", name: "OpenLMIS", description: "Logistics management system", category: "Supply Chain" },
  { id: "openmrs", name: "OpenMRS", description: "Electronic medical records", category: "Health" },
  { id: "openspp", name: "OpenSPP", description: "Social protection programs", category: "Government" },
  { id: "postgresql", name: "PostgreSQL", description: "Open-source relational database", category: "Databases" },
  { id: "powerbi", name: "Power BI", description: "Microsoft business intelligence", category: "Data & Analytics" },
  { id: "primero", name: "Primero", description: "Child protection case management", category: "Social Services" },
  { id: "rapidpro", name: "RapidPro", description: "SMS campaign and messaging", category: "Communication" },
  { id: "redis", name: "Redis", description: "In-memory data store", category: "Databases" },
  { id: "salesforce", name: "Salesforce", description: "CRM and business cloud platform", category: "CRM & ERP" },
  { id: "satusehat", name: "SATUSEHAT", description: "Indonesia health data exchange", category: "Health" },
  { id: "sftp", name: "SFTP", description: "Secure file transfer protocol", category: "General" },
  { id: "stripe", name: "Stripe", description: "Payment processing platform", category: "Payments" },
  { id: "surveycto", name: "SurveyCTO", description: "Mobile survey and data collection", category: "Data Collection" },
  { id: "tableau", name: "Tableau", description: "Data visualization platform", category: "Data & Analytics" },
  { id: "telerivet", name: "Telerivet", description: "SMS and mobile applications", category: "Communication" },
  { id: "twilio", name: "Twilio", description: "Communications platform", category: "Communication" },
  { id: "vtiger", name: "Vtiger", description: "CRM and business management", category: "CRM & ERP" },
  { id: "whatsapp", name: "WhatsApp", description: "Messaging platform", category: "Social & Messaging" },
  { id: "zoho", name: "Zoho", description: "Business software suite", category: "CRM & ERP" },
];

/** Adaptors we have a square icon for (public/images/adaptors/<id>-square.png). */
const ICONS = new Set([
  "commcare",
  "common",
  "dhis2",
  "fhir",
  "googlesheets",
  "http",
  "kobotoolbox",
  "openhim",
  "openmrs",
  "postgresql",
  "salesforce",
  "twilio",
]);

/** `@openfn/language-http@latest` → `{ package: "@openfn/language-http", version: "latest" }`. */
export function resolveAdaptor(specifier: string): { package: string; version: string } {
  const match = specifier.match(/^(@[^@]+|[^@]+)(?:@(.+))?$/);
  return { package: match?.[1] ?? specifier, version: match?.[2] ?? "latest" };
}

/** `@openfn/language-http@latest` → `http` (Lightning's extractAdaptorName). */
export function adaptorShortName(specifier: string): string {
  return resolveAdaptor(specifier).package.replace(/^@openfn\/language-/, "");
}

/** `http` → `Http`, `googlesheets` → `Googlesheets` (Lightning's getAdaptorDisplayName). */
export function adaptorDisplayName(specifier: string): string {
  const short = adaptorShortName(specifier);
  return short.charAt(0).toUpperCase() + short.slice(1);
}

export function adaptorIconUrl(specifier: string): string | null {
  const short = adaptorShortName(specifier);
  return ICONS.has(short) ? `${import.meta.env.BASE_URL}images/adaptors/${short}-square.png` : null;
}

/** The resolved version `latest` points at, shown in the Docs panel heading. */
const LATEST_VERSIONS: Record<string, string> = {
  http: "7.3.3",
  common: "3.2.3",
  dhis2: "8.0.6",
  googlesheets: "3.1.2",
  commcare: "3.2.1",
  openmrs: "4.4.0",
  twilio: "0.4.13",
};

export function resolvedAdaptorVersion(specifier: string): string {
  const { version } = resolveAdaptor(specifier);
  if (version !== "latest") return version;
  return LATEST_VERSIONS[adaptorShortName(specifier)] ?? "1.0.0";
}

/** One operation in the Docs panel's "Adaptor API" list. */
export interface AdaptorFunction {
  name: string;
  params: string[];
  description: string;
  example?: string;
}

const COMMON_FUNCTIONS: AdaptorFunction[] = [
  { name: "alterState", params: ["func"], description: "Alias for \"fn()\"." },
  { name: "arrayToString", params: ["arr", "separator"], description: "Turns an array into a string, separated by a given separator." },
  { name: "as", params: ["key", "operation"], description: "Run an operation and save the result to a custom key in state instead of overwriting state.data." },
  { name: "chunk", params: ["array", "chunkSize"], description: "Chunks an array into an array of arrays, each with no more than a certain size." },
  { name: "combine", params: ["operations"], description: "Combines two operations into one." },
  { name: "cursor", params: ["value", "options"], description: "Sets a cursor property on state." },
  { name: "dataPath", params: ["path"], description: "Ensures a path points at the data." },
  { name: "dataValue", params: ["path"], description: "Picks out a single value from the source data object.", example: "dataValue('key')" },
  { name: "del", params: ["path", "options"], description: "Remove a value from a collection." },
  { name: "each", params: ["dataSource", "operation"], description: "Scopes an array of data based on a JSONPath." },
  { name: "field", params: ["key", "value"], description: "Returns a key, value pair in an array." },
  { name: "fields", params: ["fields"], description: "Zips key value pairs into an object." },
  {
    name: "fn",
    params: ["func"],
    description: "Creates a custom step (or operation) for more flexible job writing.",
    example: "fn(state => {\n  // do some things to state\n  return state;\n});",
  },
  { name: "fnIf", params: ["condition", "operation"], description: "Execute a function only when the condition returns true." },
  { name: "group", params: ["arrayOfObjects", "keyPath", "callback"], description: "Groups an array of objects by a specified key path." },
  { name: "humanProper", params: ["str"], description: "Substitutes underscores for spaces and proper-cases a string." },
  { name: "lastReferenceValue", params: ["path"], description: "Picks out the last reference value from source data." },
  { name: "log", params: ["args"], description: "Outputs a message, like calling console.log." },
  { name: "merge", params: ["dataSource", "fields"], description: "Merges fields into each item in an array." },
  { name: "parseCsv", params: ["csvData", "parsingOptions", "callback"], description: "Takes a CSV file string or stream and parsing options as input." },
  { name: "sourceValue", params: ["path"], description: "Picks out a single value from source data." },
  { name: "split", params: ["obj", "path"], description: "Splits an object into two objects based on a list of keys." },
];

const HTTP_FUNCTIONS: AdaptorFunction[] = [
  ...COMMON_FUNCTIONS,
  { name: "get", params: ["path", "options"], description: "Make a GET request.", example: "get('/myEndpoint', {\n  query: { foo: 'bar' },\n});" },
  { name: "parseXML", params: ["data", "script"], description: "Parse XML with the Cheerio parser." },
  { name: "patch", params: ["path", "body", "options"], description: "Make a PATCH request." },
  { name: "post", params: ["path", "body", "options"], description: "Make a POST request.", example: "post('/myEndpoint', state => state.data);" },
  { name: "put", params: ["path", "body", "options"], description: "Make a PUT request." },
  { name: "request", params: ["method", "path", "options"], description: "Make a HTTP request." },
];

export function adaptorFunctions(specifier: string): AdaptorFunction[] {
  const fns = adaptorShortName(specifier) === "http" ? HTTP_FUNCTIONS : COMMON_FUNCTIONS;
  return [...fns].sort((a, b) => a.name.localeCompare(b.name));
}

/** Adaptors that never need a credential (Lightning's ADAPTORS_WITHOUT_CREDENTIALS). */
export const ADAPTORS_WITHOUT_CREDENTIALS = ["common", "http"];
