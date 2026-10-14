/**
 * Channels (Lightning's experimental HTTP proxy): a channel forwards requests
 * made to its proxy URL on to a destination service. Static fixtures for the
 * channels index (`Channels.list_channels_for_project_with_stats/1`).
 */

export interface Channel {
  id: string;
  projectId: string;
  name: string;
  enabled: boolean;
  destinationUrl: string;
  /** Project credential used to authenticate with the destination. */
  destinationCredentialId: string | null;
  /** Webhook auth methods clients use to call the channel. */
  clientAuthMethodIds: string[];
  requestCount: number;
  lastActivityAt: string | null;
}

/** Base URL the proxy URLs hang off (`LightningWeb.Endpoint.url()`). */
export const channelProxyBase = "https://app.openfn.org";

export function channelProxyUrl(channelId: string): string {
  return `${channelProxyBase}/channels/${channelId}`;
}

export const channels: Channel[] = [
  {
    id: "5c3e9a1d-7b2f-4e8a-9c6d-1f0e2d3c4b5a",
    projectId: "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa",
    name: "OpenHIE FHIR proxy",
    enabled: true,
    destinationUrl: "https://hapi.openhie.example.org/fhir",
    destinationCredentialId: "pc-openhie-basic",
    clientAuthMethodIds: ["wam-commcare"],
    requestCount: 3421,
    lastActivityAt: "2026-10-14T08:55:00Z",
  },
  {
    id: "9e8d7c6b-5a4f-4e3d-8c2b-1a0f9e8d7c6b",
    projectId: "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa",
    name: "DHIS2 tracker",
    enabled: false,
    destinationUrl: "https://play.dhis2.org/api",
    destinationCredentialId: null,
    clientAuthMethodIds: [],
    requestCount: 0,
    lastActivityAt: null,
  },
];

export function channelsIn(projectId: string): Channel[] {
  return channels.filter((c) => c.projectId === projectId);
}

export function findChannel(id: string | undefined): Channel | undefined {
  return channels.find((c) => c.id === id);
}

/** Webhook auth methods in the project (Client Credentials checkboxes). */
export const webhookAuthMethods = [
  { id: "wam-commcare", name: "CommCare basic auth" },
  { id: "wam-api-key", name: "Partner API key" },
];

/** Project credentials (Destination Credential select). */
export const projectCredentialOptions = [
  { id: "pc-openhie-basic", name: "OpenHIE basic auth" },
  { id: "pc-dhis2", name: "DHIS2 play" },
];
