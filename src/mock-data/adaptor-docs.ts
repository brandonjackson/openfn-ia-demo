import type { AdaptorKind } from "./workflow";

/**
 * A slice of each adaptor's API docs for the editor's Adaptor docs tray: the
 * functions you're most likely to reach for, with a snippet to start from.
 * Source: https://docs.openfn.org/adaptors
 */
export interface AdaptorFunction {
  name: string;
  /** e.g. "get(path, options)". */
  signature: string;
  description: string;
  /** Example job code that can be inserted into a step. */
  example: string;
}

const common: AdaptorFunction[] = [
  {
    name: "fn",
    signature: "fn(func)",
    description: "Run your own JavaScript on state and return the next state.",
    example: `fn(state => {
  state.total = state.data.length;
  return state;
});`,
  },
  {
    name: "each",
    signature: "each(dataSource, operation)",
    description: "Run an operation once for every item in an array on state.",
    example: `each('$.data.items[*]', state => {
  console.log(state.data.id);
  return state;
});`,
  },
  {
    name: "dataValue",
    signature: "dataValue(path)",
    description: "Pick a value out of state.data by its path.",
    example: `fn(state => ({
  ...state,
  name: dataValue('form.full_name')(state),
}));`,
  },
  {
    name: "cursor",
    signature: "cursor(value, options)",
    description: "Remember where the last run got to, e.g. a date to sync from.",
    example: `cursor($.lastRunAt, { defaultValue: 'today' });`,
  },
];

export const adaptorDocs: Record<AdaptorKind, AdaptorFunction[]> = {
  common,
  http: [
    {
      name: "get",
      signature: "get(path, options)",
      description: "Send a GET request and put the response body on state.data.",
      example: `get('https://example.org/api/citizens', {
  query: { name: $.application.given_name },
});`,
    },
    {
      name: "post",
      signature: "post(path, body, options)",
      description: "Send a POST request with a JSON body.",
      example: `post('https://example.org/api/citizens', $.application);`,
    },
    {
      name: "put",
      signature: "put(path, body, options)",
      description: "Replace a resource with a PUT request.",
      example: `put(\`https://example.org/api/citizens/\${$.id}\`, $.citizen);`,
    },
    {
      name: "request",
      signature: "request(method, path, options)",
      description: "Send a request with any method, e.g. PATCH or DELETE.",
      example: `request('PATCH', '/citizens/42', { body: { status: 'active' } });`,
    },
    ...common.slice(0, 2),
  ],
  postgresql: [
    {
      name: "sql",
      signature: "sql(sqlQuery, options)",
      description: "Run a SQL query and put the rows on state.data.",
      example: `sql('SELECT * FROM citizens WHERE district = $1', {
  values: [$.district],
});`,
    },
    {
      name: "insert",
      signature: "insert(table, record, options)",
      description: "Insert one record into a table.",
      example: `insert('citizens', {
  name: $.citizen.name,
  district: $.citizen.district,
});`,
    },
    {
      name: "upsert",
      signature: "upsert(table, uuid, record, options)",
      description: "Insert a record, or update it if one with the same key exists.",
      example: `upsert('citizens', 'national_id', $.citizen);`,
    },
    ...common.slice(0, 2),
  ],
  dhis2: [
    {
      name: "create",
      signature: "create(resourceType, data, options)",
      description: "Create a DHIS2 resource, e.g. a tracked entity or an event.",
      example: `create('trackedEntityInstances', {
  orgUnit: 'DiszpKrYNg8',
  trackedEntityType: 'nEenWmSyUEp',
  attributes: $.attributes,
});`,
    },
    {
      name: "get",
      signature: "get(resourceType, query, options)",
      description: "Fetch DHIS2 resources matching a query.",
      example: `get('trackedEntityInstances', { ou: 'DiszpKrYNg8' });`,
    },
    ...common.slice(0, 2),
  ],
  salesforce: [
    {
      name: "query",
      signature: "query(qs, options)",
      description: "Run a SOQL query.",
      example: `query('SELECT Id, Name FROM Account LIMIT 10');`,
    },
    {
      name: "upsert",
      signature: "upsert(sObject, externalId, records)",
      description: "Create or update records by an external id.",
      example: `upsert('Contact', 'National_ID__c', $.contact);`,
    },
    ...common.slice(0, 2),
  ],
};
