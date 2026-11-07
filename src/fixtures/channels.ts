import { channelEventAddress, type ChannelDetails } from "../model/channels";
import type { ChannelType } from "../model/page-data";
import type { ProjectComponent } from "../model/projects";

const week = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];
const dates = ["14 Oct", "15 Oct", "16 Oct", "17 Oct", "18 Oct", "19 Oct", "20 Oct"];
function days(messages: number[], errors: number[]) {
  return messages.map((m, i) => ({ label: dates[i], tick: week[i], messages: m, errors: errors[i] }));
}

const json = (value: unknown) => JSON.stringify(value, null, 2);

const applications = [
  { ref: "EPL-2026-10482", name: "Amara Okafor", site: "14 Ring Road East, Accra" },
  { ref: "EPL-2026-10481", name: "Kwame Mensah", site: "Plot 7, Adum, Kumasi" },
  { ref: "EPL-2026-10480", name: "Efua Asante", site: "22 Liberation Road, Tamale" },
  { ref: "EPL-2026-10479", name: "Yaw Boateng", site: "3 Harbour View, Takoradi" },
  { ref: "EPL-2026-10478", name: "Akosua Darko", site: "41 Oxford Street, Osu" },
  { ref: "EPL-2026-10477", name: "Kofi Owusu", site: "9 Asafo Market Road, Kumasi" },
];
const times = ["20 Oct, 09:52", "20 Oct, 09:31", "20 Oct, 08:47", "19 Oct, 17:12", "19 Oct, 15:05", "19 Oct, 11:40"];

const details: Record<string, ChannelDetails> = {
  "eplanning-submission-received": {
    channelType: "event",
    system: { name: "e-Planning Portal", adaptor: "http" },
    method: "POST",
    endpoint: "https://app.openfn.org/c/project-a/eplanning-submission-received",
    auth: "Signed with the portal's shared secret (x-signature header)",
    payload: json({
      event: "submission.received",
      applicationRef: "EPL-2026-10482",
      submittedAt: "2026-10-20T09:52:14Z",
      applicant: { name: "Amara Okafor", email: "amara.okafor@example.com" },
      siteAddress: "14 Ring Road East, Accra",
      proposal: "Two-storey rear extension",
    }),
    days: days([38, 42, 35, 12, 9, 47, 31], [0, 1, 0, 0, 0, 2, 1]),
    medianMs: 84,
    workflowId: "apply-national-id",
    messages: applications.map((a, i) => ({
      id: `msg-${a.ref}`,
      at: times[i],
      status: i === 2 ? 401 : 202,
      durationMs: [81, 92, 12, 77, 88, 85][i],
      summary: i === 2 ? `${a.ref}: signature didn't match` : `${a.ref} from ${a.name}`,
      runId: i === 2 ? undefined : ["afa317bf", "3c9e1a07", undefined, "41f7d8e3", "6b2d90aa", "c47e2d18"][i],
      body: json({
        event: "submission.received",
        applicationRef: a.ref,
        submittedAt: `2026-10-${times[i].slice(0, 2)}T${times[i].slice(-5)}:00Z`,
        applicant: { name: a.name },
        siteAddress: a.site,
      }),
    })),
  },
  "case-management-create-case": {
    channelType: "write",
    system: { name: "Case Management", adaptor: "http" },
    method: "POST",
    endpoint: "https://cms.accra.gov.example/api/v2/cases",
    auth: "Org credential: Case Management (OAuth client)",
    payload: json({
      caseType: "planning-application",
      externalRef: "EPL-2026-10482",
      applicant: { name: "Amara Okafor" },
      site: { address: "14 Ring Road East, Accra", authority: "ACC" },
      summary: "Two-storey rear extension",
    }),
    days: days([36, 40, 35, 12, 9, 44, 29], [1, 0, 0, 0, 0, 3, 0]),
    medianMs: 412,
    workflowId: "apply-national-id",
    messages: applications.map((a, i) => ({
      id: `case-${a.ref}`,
      at: times[i],
      status: i === 1 ? 409 : 201,
      durationMs: [388, 1204, 402, 437, 395, 421][i],
      summary: i === 1 ? `${a.ref}: a case already exists` : `Case opened for ${a.ref}`,
      runId: i === 2 ? undefined : ["afa317bf", "3c9e1a07", undefined, "41f7d8e3", "6b2d90aa", "c47e2d18"][i],
      body: json({ caseType: "planning-application", externalRef: a.ref, applicant: { name: a.name }, site: { address: a.site } }),
    })),
  },
};

/** A channel's details; channels without hand-written data get a plausible default from their name. */
export function channelDetails(component: ProjectComponent): ChannelDetails {
  const known = details[component.id];
  if (known) return known;
  const [system] = component.id.split("-");
  const channelType: ChannelType = /created|updated|received|registered/.test(component.id)
    ? "event"
    : /search|get|lookup/.test(component.id)
      ? "read"
      : "write";
  const systemName = system === "dhis2" ? "DHIS2" : system === "commcare" ? "CommCare" : system.charAt(0).toUpperCase() + system.slice(1);
  const event = channelType === "event";
  return {
    channelType,
    system: { name: systemName, adaptor: ["dhis2", "commcare"].includes(system) ? system : "http" },
    method: channelType === "read" ? "GET" : "POST",
    endpoint: event
      ? `https://app.openfn.org/c/${component.id}`
      : `https://${system}.example.org/api/${component.id.split("-").slice(1).join("/")}`,
    auth: event ? "API key in the x-api-key header" : `Org credential: ${systemName}`,
    payload: json({ id: "string", submitted_at: "ISO 8601", data: {} }),
    days: days([12, 15, 11, 4, 3, 17, 10], [0, 0, 1, 0, 0, 0, 0]),
    medianMs: event ? 70 : 280,
    messages: times.slice(0, 4).map((at, i) => ({
      id: `${component.id}-${i}`,
      at,
      status: event ? 202 : channelType === "read" ? 200 : 201,
      durationMs: (event ? 70 : 280) + i * 13,
      summary: component.description,
      body: json({ id: `rec-${1040 - i}`, submitted_at: "2026-10-20T09:00:00Z", data: {} }),
    })),
  };
}

/** A new channel's details, from what was asked for when it was made: no traffic yet. */
export function newChannelDetails(
  projectId: string,
  id: string,
  draft: { channelType: ChannelType; system: string; destinationUrl: string; credential?: string; enabled: boolean }
): ChannelDetails {
  const event = draft.channelType === "event";
  return {
    channelType: draft.channelType,
    system: { name: draft.system, adaptor: "http" },
    method: draft.channelType === "read" ? "GET" : "POST",
    endpoint: event ? channelEventAddress(projectId, id) : draft.destinationUrl,
    auth: event ? "API key in the x-api-key header" : draft.credential ? `Project credential: ${draft.credential}` : "None",
    payload: json({}),
    days: days([0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]),
    medianMs: 0,
    messages: [],
    enabled: draft.enabled,
    credential: draft.credential,
  };
}
