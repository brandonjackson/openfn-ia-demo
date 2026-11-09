import type { EnvVar } from "../model/env-vars";

/**
 * Project A's environment variables, as the editor shows them. The same key
 * can hold different values in different environments (DHIS2_BASE_URL), and
 * secrets come without their values, as the server sends them. The fake
 * server seeds from these, giving each a value of its own.
 */
export const projectAEnvVars: EnvVar[] = [
  {
    id: "dhis2-url-prod",
    key: "DHIS2_BASE_URL",
    value: "https://dhis2.health.gov.example",
    secret: false,
    environments: ["production"],
    updatedAt: "3 weeks ago",
    updatedBy: "Brandon Jackson",
  },
  {
    id: "dhis2-url-test",
    key: "DHIS2_BASE_URL",
    value: "https://play.im.dhis2.org/stable-2-41-1",
    secret: false,
    environments: ["staging", "mock"],
    updatedAt: "3 weeks ago",
    updatedBy: "Brandon Jackson",
  },
  {
    id: "identity-key-prod",
    key: "IDENTITY_API_KEY",
    value: null,
    secret: true,
    environments: ["production"],
    updatedAt: "2 months ago",
    updatedBy: "Amina Diallo",
  },
  {
    id: "identity-key-test",
    key: "IDENTITY_API_KEY",
    value: null,
    secret: true,
    environments: ["staging", "mock"],
    updatedAt: "2 months ago",
    updatedBy: "Amina Diallo",
  },
  {
    id: "sms-sender",
    key: "SMS_SENDER_ID",
    value: "NATIONAL-ID",
    secret: false,
    environments: ["production", "staging", "mock"],
    updatedAt: "5 days ago",
    updatedBy: "Brandon Jackson",
  },
  {
    id: "log-level",
    key: "LOG_LEVEL",
    value: "info",
    secret: false,
    environments: ["production", "staging", "mock"],
    updatedAt: "yesterday",
    updatedBy: "Brandon Jackson",
  },
];

/** What the fake server stores for each seeded secret, never sent back. */
export const seededSecretValues: Record<string, string> = {
  "identity-key-prod": "idk_live_9f2c4a7e1b",
  "identity-key-test": "idk_test_3d81b0c55a",
};

/** Seeded environment variables, by project slug. */
export const envVarsByProject: Record<string, EnvVar[]> = { "project-a": projectAEnvVars };
