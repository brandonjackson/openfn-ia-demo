/** The rest of the catalog, with what the catalog knows; the adaptors below override it. */
import type { AdaptorKind } from "../model/workflow";
import { adaptorCatalog } from "./adaptor-catalog";
import publishedSnippets from "./adaptor-snippets.json";
import type { AdaptorInfo, ProjectCredential, Snippet } from "../model/adaptor-reference";
const catalogInfo: Record<AdaptorKind, AdaptorInfo> = Object.fromEntries(
  adaptorCatalog.map((a) => [
    a.id,
    {
      id: a.id,
      name: a.name,
      version: a.version.split(".").slice(0, 2).join("."),
      package: `@openfn/language-${a.id}`,
      docsUrl: `https://docs.openfn.org/adaptors/packages/${a.id}-docs`,
      needsCredential: true,
      description: `${a.description}.`,
    },
  ])
);

export const adaptorInfo: Record<AdaptorKind, AdaptorInfo> = {
  ...catalogInfo,
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
  opencrvs: {
    id: "opencrvs",
    name: "OpenCRVS",
    version: "1.2",
    package: "@openfn/language-opencrvs",
    docsUrl: "https://docs.openfn.org/adaptors/packages/opencrvs-docs",
    needsCredential: true,
    description: "Search civil registration records and submit birth and death events to OpenCRVS.",
  },
  twilio: {
    id: "twilio",
    name: "Twilio",
    version: "1.1",
    package: "@openfn/language-twilio",
    docsUrl: "https://docs.openfn.org/adaptors/packages/twilio-docs",
    needsCredential: true,
    description: "Send SMS messages through a Twilio account.",
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
export const adaptorChoices: AdaptorKind[] = ["common", "http", "opencrvs", "twilio", "postgresql", "dhis2", "salesforce"];

/** Adaptors without snippets of their own have none. */
const noSnippets: Record<AdaptorKind, Snippet[]> = Object.fromEntries(adaptorCatalog.map((a) => [a.id, []]));

/**
 * Snippets for every adaptor, as published in adaptors-storybook
 * (`packages/<adaptor>/snippets.json`), keyed by adaptor id. Refresh it from
 * there rather than editing it by hand.
 */
const storybookSnippets = publishedSnippets as Record<AdaptorKind, Snippet[]>;

export const adaptorSnippets: Record<AdaptorKind, Snippet[]> = {
  ...noSnippets,
  ...storybookSnippets,
  // Common has no published snippets yet.
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
};

export const projectCredentials: ProjectCredential[] = [
  { id: "cred-identity-prod", name: "Identity API (production)", adaptor: "http", owner: "Brandon Jackson" },
  { id: "cred-identity-staging", name: "Identity API (staging)", adaptor: "http", owner: "Brandon Jackson" },
  { id: "cred-notify", name: "Notification gateway", adaptor: "http", owner: "Amara Okafor" },
  { id: "cred-opencrvs", name: "OpenCRVS (Farajaland)", adaptor: "opencrvs", owner: "Brandon Jackson" },
  { id: "cred-twilio", name: "Twilio SMS", adaptor: "twilio", owner: "Amara Okafor" },
  { id: "cred-pg-citizens", name: "Citizens database", adaptor: "postgresql", owner: "Brandon Jackson" },
  { id: "cred-dhis2-play", name: "DHIS2 play", adaptor: "dhis2", owner: "Jane Doe" },
  { id: "cred-sf-sandbox", name: "Salesforce sandbox", adaptor: "salesforce", owner: "Jane Doe" },
];

/** The credentials a step on `adaptor` can pick from. */
export function credentialsFor(adaptor: AdaptorKind): ProjectCredential[] {
  return projectCredentials.filter((c) => c.adaptor === adaptor);
}
