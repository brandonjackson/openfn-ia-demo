/**
 * Every adaptor a step can use, sorted into the categories the "Connect a
 * system" picker shows. Ids, names and versions come from the adaptors
 * storybook (github.com/brandonjackson/adaptors-storybook, packages/*); the
 * categories are ours.
 */

export interface CatalogAdaptor {
  id: string;
  name: string;
  /** One line on what the system is. */
  description: string;
  /** Latest published version. */
  version: string;
}

export const adaptorCatalog: CatalogAdaptor[] = [
  { id: "arcgis", name: "ArcGIS", description: "Geospatial data and mapping", version: "1.1.2" },
  { id: "asana", name: "Asana", description: "Project and task management", version: "5.1.2" },
  { id: "aws-s3", name: "AWS S3", description: "Amazon cloud storage", version: "1.1.2" },
  { id: "azure-storage", name: "Azure Storage", description: "Microsoft Azure cloud storage", version: "3.1.2" },
  { id: "beyonic", name: "Beyonic", description: "Mobile money and payments", version: "0.4.2" },
  { id: "bigquery", name: "BigQuery", description: "Google data warehouse and analytics", version: "4.1.2" },
  { id: "browserless", name: "Browserless", description: "Headless browser for scraping and screenshots", version: "1.1.2" },
  { id: "cartodb", name: "CartoDB", description: "Location intelligence and mapping", version: "0.5.2" },
  { id: "chatgpt", name: "ChatGPT", description: "OpenAI models", version: "2.1.2" },
  { id: "cht", name: "Community Health Toolkit", description: "Community health platform", version: "1.2.2" },
  { id: "claude", name: "Claude", description: "Anthropic models", version: "1.1.2" },
  { id: "collections", name: "Collections", description: "Store and look up data between runs", version: "0.9.3" },
  { id: "commcare", name: "CommCare", description: "Mobile data collection for frontline workers", version: "4.1.2" },
  { id: "common", name: "Common", description: "Map, filter and shape data between steps", version: "3.3.4" },
  { id: "dagu", name: "Dagu", description: "Workflow scheduling and DAG runs", version: "1.3.2" },
  { id: "dhis2", name: "DHIS2", description: "District Health Information System", version: "8.2.0" },
  { id: "divoc", name: "DIVOC", description: "Digital vaccination certificates", version: "0.2.2" },
  { id: "dynamics", name: "Microsoft Dynamics", description: "CRM and ERP platform", version: "0.6.2" },
  { id: "erpnext", name: "ERPNext", description: "Open-source ERP system", version: "1.1.2" },
  { id: "et-mfr", name: "Ethiopia MFR", description: "Ethiopia's master facility registry", version: "1.0.10" },
  { id: "facebook", name: "Facebook", description: "Messenger and pages", version: "0.5.2" },
  { id: "fhir", name: "FHIR", description: "Healthcare interoperability resources", version: "5.1.2" },
  { id: "fhir-4", name: "FHIR R4", description: "FHIR release 4 resources", version: "0.5.5" },
  { id: "fhir-eswatini", name: "FHIR Eswatini", description: "Eswatini's FHIR implementation guide", version: "0.8.0" },
  { id: "fhir-fr", name: "FHIR France", description: "France's FHIR profiles", version: "1.1.2" },
  { id: "fhir-ndr-et", name: "FHIR NDR Ethiopia", description: "Ethiopia's national HIV data repository", version: "0.2.2" },
  { id: "flutterwave", name: "Flutterwave", description: "African payment processing", version: "1.0.7" },
  { id: "formsg", name: "FormSG", description: "Government form builder", version: "1.0.11" },
  { id: "gemini", name: "Gemini", description: "Google models", version: "1.0.7" },
  { id: "ghana-bdr", name: "Ghana BDR", description: "Ghana's birth and death registry", version: "0.2.2" },
  { id: "ghana-nia", name: "Ghana NIA", description: "Ghana's national identity authority", version: "0.2.2" },
  { id: "gmail", name: "Gmail", description: "Google email service", version: "2.1.2" },
  { id: "godata", name: "Go.Data", description: "Outbreak and contact tracing", version: "3.6.2" },
  { id: "googledrive", name: "Google Drive", description: "Cloud file storage", version: "3.1.2" },
  { id: "googlehealthcare", name: "Google Healthcare", description: "Google Cloud Healthcare API", version: "1.2.2" },
  { id: "googlesheets", name: "Google Sheets", description: "Cloud spreadsheets", version: "4.1.2" },
  { id: "hive", name: "Apache Hive", description: "Data warehouse on Hadoop", version: "0.4.2" },
  { id: "http", name: "HTTP", description: "Call any REST API", version: "7.3.2" },
  { id: "hubtel", name: "Hubtel", description: "Payments and SMS in Ghana", version: "1.1.2" },
  { id: "ibipimo", name: "Ibipimo", description: "Laboratory system", version: "1.1.2" },
  { id: "ihris", name: "iHRIS", description: "Human resources for health", version: "1.2.2" },
  { id: "inform", name: "InForm", description: "UNICEF's data collection platform", version: "1.3.2" },
  { id: "intuit", name: "QuickBooks", description: "Accounting by Intuit", version: "1.1.2" },
  { id: "khanacademy", name: "Khan Academy", description: "Educational content platform", version: "0.6.2" },
  { id: "kobotoolbox", name: "KoboToolbox", description: "Survey and data collection", version: "4.3.2" },
  { id: "lamisplus", name: "LAMISPlus", description: "HIV patient records", version: "0.2.2" },
  { id: "magpi", name: "Magpi", description: "Mobile data collection", version: "1.3.2" },
  { id: "mailchimp", name: "Mailchimp", description: "Email marketing", version: "1.1.2" },
  { id: "mailgun", name: "Mailgun", description: "Email sending", version: "0.7.2" },
  { id: "maximo", name: "Maximo", description: "Asset and maintenance management", version: "0.6.2" },
  { id: "medicmobile", name: "Medic Mobile", description: "Community health worker platform", version: "0.6.2" },
  { id: "memento", name: "Memento", description: "Mobile database", version: "1.1.2" },
  { id: "mifos", name: "Mifos", description: "Open-source core banking", version: "0.1.0" },
  { id: "minio", name: "MinIO", description: "S3-compatible object storage", version: "1.1.2" },
  { id: "mogli", name: "Mogli", description: "SMS for Salesforce", version: "0.7.2" },
  { id: "mojatax", name: "MojaTax", description: "Tax compliance", version: "1.1.2" },
  { id: "mongodb", name: "MongoDB", description: "NoSQL document database", version: "2.2.2" },
  { id: "monnify", name: "Monnify", description: "Payments in Nigeria", version: "1.1.2" },
  { id: "mosip", name: "MOSIP", description: "Modular open-source identity platform", version: "0.1.0" },
  { id: "motherduck", name: "MotherDuck", description: "Cloud DuckDB", version: "1.1.2" },
  { id: "mpesa", name: "M-Pesa", description: "Mobile money", version: "1.2.2" },
  { id: "msgraph", name: "Microsoft Graph", description: "Microsoft 365: Outlook, SharePoint, Excel", version: "0.9.2" },
  { id: "mssql", name: "Microsoft SQL Server", description: "Relational database", version: "7.1.2" },
  { id: "msupply", name: "mSupply", description: "Medical supply chain", version: "1.1.2" },
  { id: "mtn-momo", name: "MTN MoMo", description: "MTN mobile money", version: "1.2.2" },
  { id: "mysql", name: "MySQL", description: "Open-source relational database", version: "4.1.2" },
  { id: "nexmo", name: "Vonage (Nexmo)", description: "SMS and voice", version: "0.6.2" },
  { id: "ocl", name: "Open Concept Lab", description: "Terminology and code lists", version: "1.3.2" },
  { id: "odk", name: "ODK", description: "Offline form collection", version: "3.1.2" },
  { id: "odoo", name: "Odoo", description: "Open-source ERP and CRM", version: "2.2.2" },
  { id: "openboxes", name: "OpenBoxes", description: "Inventory and supply chain", version: "1.1.2" },
  { id: "opencrvs", name: "OpenCRVS", description: "Civil registration", version: "1.2.2" },
  { id: "openelis", name: "OpenELIS", description: "Laboratory information system", version: "1.1.2" },
  { id: "openfn", name: "OpenFn", description: "OpenFn's own API: projects, runs, workflows", version: "3.1.2" },
  { id: "openg2p", name: "OpenG2P", description: "Government-to-person payments", version: "0.1.0" },
  { id: "openhim", name: "OpenHIM", description: "Health interoperability mediator", version: "2.1.2" },
  { id: "openimis", name: "openIMIS", description: "Health insurance and social protection", version: "3.1.2" },
  { id: "openlmis", name: "OpenLMIS", description: "Logistics management", version: "1.2.2" },
  { id: "openmrs", name: "OpenMRS", description: "Electronic medical records", version: "5.4.2" },
  { id: "openspp", name: "OpenSPP", description: "Social protection programmes", version: "3.1.2" },
  { id: "pdfshift", name: "PDFShift", description: "Turn HTML into PDFs", version: "1.1.2" },
  { id: "pesapal", name: "Pesapal", description: "Payments in East Africa", version: "1.2.2" },
  { id: "ping", name: "Ping", description: "Check a service is up", version: "1.1.2" },
  { id: "postgresql", name: "PostgreSQL", description: "Open-source relational database", version: "8.1.2" },
  { id: "primero", name: "Primero", description: "Child protection case management", version: "4.1.2" },
  { id: "progres", name: "ProGres", description: "UNHCR refugee case management", version: "2.1.2" },
  { id: "puntosolidario-rd", name: "Punto Solidario", description: "Dominican Republic social payments", version: "1.1.2" },
  { id: "rapidpro", name: "RapidPro", description: "SMS and chat flows", version: "2.1.2" },
  { id: "redis", name: "Redis", description: "In-memory data store", version: "1.4.2" },
  { id: "resourcemap", name: "Resource Map", description: "Geospatial site registry", version: "0.5.2" },
  { id: "salesforce", name: "Salesforce", description: "CRM and business cloud", version: "9.1.5" },
  { id: "satusehat", name: "SATUSEHAT", description: "Indonesia's health data exchange", version: "3.1.2" },
  { id: "senaite", name: "SENAITE", description: "Laboratory information management", version: "1.1.2" },
  { id: "sftp", name: "SFTP", description: "Secure file transfer", version: "3.1.2" },
  { id: "siuben-rd", name: "SIUBEN", description: "Dominican Republic beneficiary registry", version: "1.1.2" },
  { id: "stripe", name: "Stripe", description: "Payment processing", version: "1.1.2" },
  { id: "sunbird-rc", name: "Sunbird RC", description: "Registries and verifiable credentials", version: "1.1.2" },
  { id: "surveycto", name: "SurveyCTO", description: "Mobile surveys", version: "3.1.2" },
  { id: "telerivet", name: "Telerivet", description: "SMS and mobile apps", version: "0.4.2" },
  { id: "twilio", name: "Twilio", description: "SMS, voice and WhatsApp", version: "1.1.2" },
  { id: "varo", name: "Varo", description: "Cold chain reports", version: "2.2.2" },
  { id: "vtiger", name: "Vtiger", description: "CRM", version: "1.4.2" },
  { id: "whatsapp", name: "WhatsApp", description: "Messaging", version: "1.1.2" },
  { id: "wigal-sms", name: "Wigal SMS", description: "SMS gateway in Ghana", version: "0.2.2" },
  { id: "zata", name: "Zata", description: "Tax compliance", version: "1.1.2" },
  { id: "zoho", name: "Zoho", description: "Business software suite", version: "0.5.2" },
];

const byId = new Map(adaptorCatalog.map((a) => [a.id, a]));

/** An adaptor from the catalog, by id. */
export function catalogAdaptor(id: string): CatalogAdaptor | undefined {
  return byId.get(id);
}

/** A titled list of adaptors inside a category, e.g. "Email" under Messaging. */
export interface CatalogGroup {
  label: string;
  adaptors: string[];
}

export interface CatalogCategory {
  id: string;
  label: string;
  groups: CatalogGroup[];
}

/**
 * The picker's categories, after Connected and AI. Every adaptor in the
 * catalog sits in exactly one group, except the built-in tools, which the
 * Connected tab lists beside the project's systems.
 */
export const catalogCategories: CatalogCategory[] = [
  {
    id: "health",
    label: "Health",
    groups: [
      {
        label: "Records and reporting",
        adaptors: ["dhis2", "openmrs", "cht", "medicmobile", "lamisplus", "godata", "ihris", "et-mfr", "openimis", "divoc", "satusehat"],
      },
      {
        label: "Interoperability",
        adaptors: ["fhir", "fhir-4", "fhir-eswatini", "fhir-fr", "fhir-ndr-et", "openhim", "googlehealthcare", "ocl"],
      },
      { label: "Labs and supply chain", adaptors: ["openelis", "senaite", "ibipimo", "openlmis", "msupply", "openboxes", "varo"] },
    ],
  },
  {
    id: "data-collection",
    label: "Data collection",
    groups: [
      { label: "Mobile data collection", adaptors: ["commcare", "kobotoolbox", "odk", "surveycto", "magpi"] },
      { label: "Forms and records", adaptors: ["formsg", "inform", "memento"] },
    ],
  },
  {
    id: "messaging",
    label: "Messaging",
    groups: [
      { label: "SMS and chat", adaptors: ["twilio", "rapidpro", "telerivet", "whatsapp", "facebook", "nexmo", "mogli", "wigal-sms"] },
      { label: "Email", adaptors: ["gmail", "mailchimp", "mailgun"] },
    ],
  },
  {
    id: "government",
    label: "Government",
    groups: [
      { label: "Civil registration and ID", adaptors: ["opencrvs", "mosip", "ghana-bdr", "ghana-nia", "sunbird-rc"] },
      { label: "Social protection", adaptors: ["openg2p", "openspp", "siuben-rd", "puntosolidario-rd"] },
      { label: "Case management", adaptors: ["primero", "progres"] },
      { label: "Education", adaptors: ["khanacademy"] },
    ],
  },
  {
    id: "business",
    label: "Business and finance",
    groups: [
      {
        label: "Payments and mobile money",
        adaptors: ["stripe", "mpesa", "mtn-momo", "flutterwave", "beyonic", "monnify", "pesapal", "hubtel"],
      },
      { label: "Accounting and tax", adaptors: ["intuit", "mifos", "mojatax", "zata"] },
      { label: "CRM and operations", adaptors: ["salesforce", "dynamics", "zoho", "odoo", "erpnext", "vtiger", "asana", "maximo", "msgraph"] },
    ],
  },
  {
    id: "data",
    label: "Data and files",
    groups: [
      { label: "Databases", adaptors: ["postgresql", "mysql", "mssql", "mongodb", "redis"] },
      { label: "Warehouses", adaptors: ["bigquery", "hive", "motherduck"] },
      { label: "Files and storage", adaptors: ["googlesheets", "googledrive", "aws-s3", "azure-storage", "minio", "sftp"] },
      { label: "Maps", adaptors: ["arcgis", "cartodb", "resourcemap"] },
    ],
  },
];

/** Tools that don't connect to a system of their own, shown on the Connected tab. */
export const builtInTools = ["common", "http", "collections", "openfn", "pdfshift", "browserless", "ping", "dagu"];

/** The models behind the AI tab's actions. */
export const aiModels = ["claude", "chatgpt", "gemini"];

export interface AiAction {
  id: string;
  label: string;
  description: string;
  /** The step's starting code: a prompt over the incoming data. */
  body: string;
}

const prompt = (instruction: string) =>
  `// ${instruction}\nprompt(state => \`${instruction}\n\n\${JSON.stringify(state.data)}\`);\n`;

/** What the AI tab offers. Each adds a Claude step with a prompt to match. */
export const aiActions: AiAction[] = [
  {
    id: "generate",
    label: "Generate",
    description: "Write text from the incoming data, like a message or a report.",
    body: prompt("Write a short, friendly message from this record."),
  },
  {
    id: "summarize",
    label: "Summarize",
    description: "Boil long records or notes down to the key points.",
    body: prompt("Summarize this record in three bullet points."),
  },
  {
    id: "translate",
    label: "Translate",
    description: "Turn text fields into another language.",
    body: prompt("Translate the text fields of this record into French."),
  },
  {
    id: "classify",
    label: "Classify",
    description: "Sort each record into one of a set of labels.",
    body: prompt("Classify this record as urgent, routine or spam. Reply with the label only."),
  },
  {
    id: "extract",
    label: "Extract",
    description: "Pull structured fields out of free text.",
    body: prompt("Extract the name, date of birth and phone number from this text as JSON."),
  },
];
