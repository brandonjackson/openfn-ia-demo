/**
 * Channel requests for History's Channel Logs tab and the channel request
 * page (Lightning's `Channels.list_channel_requests` and `ChannelRequestLive`).
 * Static fixtures only.
 */

const OPENHIE = "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa";

export type ChannelRequestState = "pending" | "success" | "failed" | "timeout" | "error";

export interface Channel {
  id: string;
  projectId: string;
  name: string;
  destinationUrl: string;
  lockVersion: number;
}

export interface ChannelEvent {
  type: "destination_response" | "error";
  requestMethod: string;
  requestPath: string;
  requestQueryString: string | null;
  requestHeaders: [string, string][] | null;
  requestBodyPreview: string | null;
  requestBodySize: number | null;
  requestBodyHash: string | null;
  responseStatus: number | null;
  responseHeaders: [string, string][] | null;
  responseBodyPreview: string | null;
  responseBodySize: number | null;
  responseBodyHash: string | null;
  /** Microseconds. */
  latencyUs: number | null;
  ttfbUs: number | null;
  queueUs: number | null;
  connectUs: number | null;
  requestSendUs: number | null;
  responseDurationUs: number | null;
  reusedConnection: boolean;
  errorMessage: string | null;
}

export interface ChannelRequest {
  id: string;
  /** The client-facing request id (shown in the table). */
  requestId: string;
  channelId: string;
  projectId: string;
  state: ChannelRequestState;
  startedAt: string;
  completedAt: string | null;
  clientIdentity: string | null;
  clientAuth: string;
  destinationAuth: string;
  isWiped: boolean;
  /** The channel's config as it was when the request ran. */
  snapshot: { name: string; destinationUrl: string; lockVersion: number };
  events: ChannelEvent[];
}

export const channels: Channel[] = [
  {
    id: "ch-shr",
    projectId: OPENHIE,
    name: "SHR proxy",
    destinationUrl: "https://openhim.example.org/fhir",
    lockVersion: 3,
  },
  {
    id: "ch-commcare",
    projectId: OPENHIE,
    name: "CommCare forms",
    destinationUrl: "https://commcare.example.org/a/openfn/api/v0.5",
    lockVersion: 1,
  },
];

const jsonHeaders: [string, string][] = [
  ["content-type", "application/json"],
  ["user-agent", "CommCareHQ"],
  ["authorization", "[REDACTED]"],
  ["x-request-id", "4f1c9a8e-2b6d-4e1f-9c3a-7d5e8b2a1f60"],
];

const patientBody = JSON.stringify(
  { resourceType: "Patient", name: [{ given: ["Aisha"], family: "Okafor" }], gender: "female", birthDate: "2024-11-02" },
  null,
  2
);

export const channelRequests: ChannelRequest[] = [
  {
    id: "4f1c9a8e-2b6d-4e1f-9c3a-7d5e8b2a1f60",
    requestId: "c81d3e5a-77f2-4c0b-a1e9-3b6f0d2c9e14",
    channelId: "ch-shr",
    projectId: OPENHIE,
    state: "success",
    startedAt: "2026-10-14T09:31:12Z",
    completedAt: "2026-10-14T09:31:12.284Z",
    clientIdentity: "10.0.4.17",
    clientAuth: "CommCare API key (API key)",
    destinationAuth: "OpenHIM basic auth",
    isWiped: false,
    snapshot: { name: "SHR proxy", destinationUrl: "https://openhim.example.org/fhir", lockVersion: 3 },
    events: [
      {
        type: "destination_response",
        requestMethod: "POST",
        requestPath: "/fhir/Patient",
        requestQueryString: null,
        requestHeaders: jsonHeaders,
        requestBodyPreview: patientBody,
        requestBodySize: 152,
        requestBodyHash: "9f2b6c1e4d7a8b3c5e0f1a2d4c6b8e0f9a1c3e5d7b9f0a2c4e6d8b0f2a4c6e8d",
        responseStatus: 201,
        responseHeaders: [
          ["content-type", "application/fhir+json"],
          ["location", "Patient/58213"],
          ["date", "Wed, 14 Oct 2026 09:31:12 GMT"],
        ],
        responseBodyPreview: JSON.stringify({ resourceType: "Patient", id: "58213" }, null, 2),
        responseBodySize: 48,
        responseBodyHash: null,
        latencyUs: 284_000,
        ttfbUs: 251_000,
        queueUs: 1_200,
        connectUs: 38_400,
        requestSendUs: 2_100,
        responseDurationUs: 31_000,
        reusedConnection: false,
        errorMessage: null,
      },
    ],
  },
  {
    id: "7b3e0d2a-91c4-4f6e-8a5d-2c1b9e7f4a30",
    requestId: "e2a94f17-0c3b-4d8e-b6a1-5f9c2e7d3b08",
    channelId: "ch-shr",
    projectId: OPENHIE,
    state: "failed",
    startedAt: "2026-10-14T08:02:45Z",
    completedAt: "2026-10-14T08:02:45.131Z",
    clientIdentity: "10.0.4.17",
    clientAuth: "CommCare API key (API key)",
    destinationAuth: "OpenHIM basic auth",
    isWiped: false,
    snapshot: { name: "SHR proxy", destinationUrl: "https://openhim.example.org/fhir", lockVersion: 2 },
    events: [
      {
        type: "destination_response",
        requestMethod: "GET",
        requestPath: "/fhir/Patient/99999",
        requestQueryString: "_format=json",
        requestHeaders: jsonHeaders.slice(1),
        requestBodyPreview: "",
        requestBodySize: 0,
        requestBodyHash: null,
        responseStatus: 404,
        responseHeaders: [["content-type", "application/fhir+json"]],
        responseBodyPreview: JSON.stringify(
          { resourceType: "OperationOutcome", issue: [{ severity: "error", code: "not-found" }] },
          null,
          2
        ),
        responseBodySize: 96,
        responseBodyHash: null,
        latencyUs: 131_000,
        ttfbUs: 118_500,
        queueUs: null,
        connectUs: null,
        requestSendUs: null,
        responseDurationUs: null,
        reusedConnection: true,
        errorMessage: null,
      },
    ],
  },
  {
    id: "a90c6e14-3f2b-4d7a-9e81-6b5c0f2d8e47",
    requestId: "5d7f2b90-6e1a-4c3d-8f2b-9a0e4c6b1d73",
    channelId: "ch-commcare",
    projectId: OPENHIE,
    state: "error",
    startedAt: "2026-10-13T16:20:03Z",
    completedAt: "2026-10-13T16:20:08Z",
    clientIdentity: "41.79.12.200",
    clientAuth: "None",
    destinationAuth: "CommCare HQ",
    isWiped: false,
    snapshot: {
      name: "CommCare forms",
      destinationUrl: "https://commcare.example.org/a/openfn/api/v0.5",
      lockVersion: 1,
    },
    events: [
      {
        type: "error",
        requestMethod: "POST",
        requestPath: "/a/openfn/api/v0.5/form",
        requestQueryString: null,
        requestHeaders: [["content-type", "application/json"]],
        requestBodyPreview: JSON.stringify({ form: { "@name": "Patient registration" } }, null, 2),
        requestBodySize: 52,
        requestBodyHash: null,
        responseStatus: null,
        responseHeaders: null,
        responseBodyPreview: null,
        responseBodySize: null,
        responseBodyHash: null,
        latencyUs: 5_000_000,
        ttfbUs: null,
        queueUs: null,
        connectUs: null,
        requestSendUs: null,
        responseDurationUs: null,
        reusedConnection: false,
        errorMessage: "econnrefused",
      },
    ],
  },
];

export function channelsIn(projectId: string): Channel[] {
  return channels.filter((c) => c.projectId === projectId);
}

export function findChannel(id: string | undefined): Channel | undefined {
  return channels.find((c) => c.id === id);
}

export function channelRequestsIn(projectId: string): ChannelRequest[] {
  return channelRequests.filter((r) => r.projectId === projectId);
}

export function findChannelRequest(id: string | undefined): ChannelRequest | undefined {
  return channelRequests.find((r) => r.id === id);
}

/** Prefers the destination response event, falls back to the error event. */
export function primaryEvent(cr: ChannelRequest): ChannelEvent | undefined {
  return cr.events.find((e) => e.type === "destination_response") ?? cr.events.find((e) => e.type === "error");
}
