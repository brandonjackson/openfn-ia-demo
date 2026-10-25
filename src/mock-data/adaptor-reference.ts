import type { AdaptorKind } from "./workflow";

/**
 * What the editor knows about each adaptor a step can use: its display name
 * and version, where its docs live, whether it needs a credential, and a
 * handful of code snippets for its most-used operations.
 */
export interface AdaptorInfo {
  id: AdaptorKind;
  name: string;
  /** The package version pinned in this project, e.g. "2.1". */
  version: string;
  package: string;
  docsUrl: string;
  needsCredential: boolean;
  description: string;
}

export interface Snippet {
  id: string;
  /** The operation or pattern, e.g. "get" or "each". */
  title: string;
  description: string;
  code: string;
}

export const adaptorInfo: Record<AdaptorKind, AdaptorInfo> = {
  common: {
    id: "common",
    name: "Common",
    version: "2.1",
    package: "@openfn/language-common",
    docsUrl: "https://docs.openfn.org/adaptors/packages/common-docs",
    needsCredential: false,
    description: "Plain JavaScript over state: map, filter and shape data between steps.",
  },
  http: {
    id: "http",
    name: "HTTP",
    version: "7.3",
    package: "@openfn/language-http",
    docsUrl: "https://docs.openfn.org/adaptors/packages/http-docs",
    needsCredential: true,
    description: "Call any REST API with get, post, put, patch and delete.",
  },
  dhis2: {
    id: "dhis2",
    name: "DHIS2",
    version: "8.0",
    package: "@openfn/language-dhis2",
    docsUrl: "https://docs.openfn.org/adaptors/packages/dhis2-docs",
    needsCredential: true,
    description: "Create and update tracked entities, events and data values in DHIS2.",
  },
  salesforce: {
    id: "salesforce",
    name: "Salesforce",
    version: "6.2",
    package: "@openfn/language-salesforce",
    docsUrl: "https://docs.openfn.org/adaptors/packages/salesforce-docs",
    needsCredential: true,
    description: "Query, create and upsert Salesforce records.",
  },
  postgresql: {
    id: "postgresql",
    name: "Postgres",
    version: "5.1",
    package: "@openfn/language-postgresql",
    docsUrl: "https://docs.openfn.org/adaptors/packages/postgresql-docs",
    needsCredential: true,
    description: "Run SQL, insert and upsert rows in a PostgreSQL database.",
  },
};

/** Every adaptor a step can be switched to, in picker order. */
export const adaptorChoices: AdaptorKind[] = ["common", "http", "postgresql", "dhis2", "salesforce"];

export const adaptorSnippets: Record<AdaptorKind, Snippet[]> = {
  common: [
    {
      id: "fn",
      title: "fn",
      description: "Run a function over state and return the new state.",
      code: `fn(state => {\n  // change state here\n  return state;\n});`,
    },
    {
      id: "each",
      title: "each",
      description: "Do something for every item in an array on state.",
      code: `each('$.data.items[*]', fn(state => {\n  console.log(state.data);\n  return state;\n}));`,
    },
    {
      id: "cursor",
      title: "cursor",
      description: "Keep a timestamp between runs to fetch only what's new.",
      code: `cursor($.cursor, { defaultValue: 'today' });`,
    },
    {
      id: "dataValue",
      title: "dataValue",
      description: "Read a value off state.data by path.",
      code: `fn(state => {\n  const name = dataValue('full_name')(state);\n  return { ...state, name };\n});`,
    },
    {
      id: "skip",
      title: "Skip the rest of the workflow",
      description: "Return early and flag downstream steps to skip.",
      code: `fn(state => {\n  if (!state.data.consent) {\n    console.log('Skipped: no consent');\n    return { ...state, skip: true };\n  }\n  return state;\n});`,
    },
  ],
  http: [
    {
      id: "get",
      title: "get",
      description: "GET a resource and put the response body on state.data.",
      code: `get('/api/v1/citizens', {\n  query: { district: $.data.district },\n});`,
    },
    {
      id: "post",
      title: "post",
      description: "POST a JSON body.",
      code: `post('/api/v1/citizens', {\n  body: $.citizen,\n  headers: { 'content-type': 'application/json' },\n});`,
    },
    {
      id: "put",
      title: "put",
      description: "Replace a resource.",
      code: `put('/api/v1/citizens/' + $.data.id, { body: $.citizen });`,
    },
    {
      id: "request",
      title: "request",
      description: "Any method, with full control over the options.",
      code: `request('PATCH', '/api/v1/citizens/123', {\n  body: { consent: true },\n  errors: { 404: false },\n});`,
    },
    {
      id: "paginate",
      title: "Paginate with a cursor",
      description: "Follow next-page links until there are none.",
      code: `get('/api/v1/citizens', { query: { page: 1 } });\n\nfn(state => {\n  state.citizens = [...(state.citizens ?? []), ...state.data.results];\n  return state;\n});`,
    },
  ],
  postgresql: [
    {
      id: "sql",
      title: "sql",
      description: "Run a SQL statement.",
      code: `sql('SELECT * FROM citizens WHERE district = $1', {\n  values: [$.citizen.district],\n});`,
    },
    {
      id: "insert",
      title: "insert",
      description: "Insert one row.",
      code: `insert('citizens', {\n  name: $.citizen.name,\n  district: $.citizen.district,\n  submitted_at: $.citizen.submitted_at,\n});`,
    },
    {
      id: "upsert",
      title: "upsert",
      description: "Insert, or update when the key already exists.",
      code: `upsert('citizens', 'external_id', {\n  external_id: $.data._id,\n  name: $.citizen.name,\n});`,
    },
    {
      id: "insertMany",
      title: "insertMany",
      description: "Insert an array of rows in one statement.",
      code: `insertMany('submissions', state => state.rows);`,
    },
  ],
  dhis2: [
    {
      id: "create",
      title: "create",
      description: "Create a resource, e.g. a tracked entity or event.",
      code: `create('trackedEntityInstances', {\n  orgUnit: $.data.orgUnit,\n  trackedEntityType: 'nEenWmSyUEp',\n  attributes: [{ attribute: 'w75KJ2mc4zz', value: $.data.given_name }],\n});`,
    },
    {
      id: "update",
      title: "update",
      description: "Update a resource by id.",
      code: `update('events', $.data.eventId, { status: 'COMPLETED' });`,
    },
    {
      id: "get",
      title: "get",
      description: "Fetch resources with filters.",
      code: `get('dataValueSets', {\n  dataSet: 'pBOMPrpg1QX',\n  orgUnit: 'DiszpKrYNg8',\n  period: '202610',\n});`,
    },
    {
      id: "upsert",
      title: "upsert",
      description: "Create or update by matching on an attribute.",
      code: `upsert('trackedEntityInstances', {\n  ou: $.data.orgUnit,\n  filter: ['w75KJ2mc4zz:Eq:' + $.data.given_name],\n}, { attributes: [] });`,
    },
  ],
  salesforce: [
    {
      id: "query",
      title: "query",
      description: "Run a SOQL query.",
      code: `query('SELECT Id, Name FROM Contact WHERE Email = \\'' + $.data.email + '\\'');`,
    },
    {
      id: "create",
      title: "create",
      description: "Create a record.",
      code: `create('Contact', {\n  FirstName: $.data.given_name,\n  LastName: $.data.family_name,\n  Email: $.data.email,\n});`,
    },
    {
      id: "upsert",
      title: "upsert",
      description: "Upsert on an external id field.",
      code: `upsert('Contact', 'External_Id__c', {\n  External_Id__c: $.data._id,\n  Email: $.data.email,\n});`,
    },
    {
      id: "bulk",
      title: "bulk",
      description: "Load many records through the Bulk API.",
      code: `bulk('Contact', 'insert', state => state.contacts, {\n  failOnError: true,\n});`,
    },
  ],
};

/** A credential in the project that a step can be given. */
export interface ProjectCredential {
  id: string;
  name: string;
  adaptor: AdaptorKind;
  owner: string;
}

export const projectCredentials: ProjectCredential[] = [
  { id: "cred-identity-prod", name: "Identity API (production)", adaptor: "http", owner: "Brandon Jackson" },
  { id: "cred-identity-staging", name: "Identity API (staging)", adaptor: "http", owner: "Brandon Jackson" },
  { id: "cred-notify", name: "Notification gateway", adaptor: "http", owner: "Amara Okafor" },
  { id: "cred-pg-citizens", name: "Citizens database", adaptor: "postgresql", owner: "Brandon Jackson" },
  { id: "cred-dhis2-play", name: "DHIS2 play", adaptor: "dhis2", owner: "Jane Doe" },
  { id: "cred-sf-sandbox", name: "Salesforce sandbox", adaptor: "salesforce", owner: "Jane Doe" },
];

/** The credentials a step on `adaptor` can pick from. */
export function credentialsFor(adaptor: AdaptorKind): ProjectCredential[] {
  return projectCredentials.filter((c) => c.adaptor === adaptor);
}
