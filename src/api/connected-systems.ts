/**
 * The organisation's connected systems and their access grants, on the
 * demo's own routes (`/api/demo/connected_systems`; Lightning's API has no
 * connected systems yet).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ConnectedSystem, SystemChanges, AccessGrant, SuggestedSystem, SystemChannel } from "../model/connected-systems";
import type { Adaptor } from "../model/adaptors";
import { lineColors, type Ecosystem, type EcosystemStation, type EcosystemWorkflow, type LineColor } from "../model/ecosystem";
import { linkId } from "../model/ecosystem-map";
import { triggerTypes, type TriggerType } from "../model/workflow";
import { listAll, request, none } from "./client";
import { statusOf, type LoadStatus } from "./status";

interface ApiSystem {
  id: string;
  attributes: Omit<ConnectedSystem, "id"> & { access_grant_count: number };
}

// Under the systems' key, so a change to a system reloads the suggestions and the map too.
export const systemKeys = {
  all: ["connected_systems"] as const,
  grants: (id: string) => ["connected_systems", id, "grants"] as const,
  suggestions: ["connected_systems", "suggestions"] as const,
  ecosystem: ["connected_systems", "ecosystem"] as const,
  channels: ["connected_systems", "channels"] as const,
};

interface ApiSystemChannel {
  id: string;
  attributes: { name: string; description: string; channel_type: SystemChannel["channelType"]; section: string };
  relationships: { connected_system: { data: { id: string } } };
}

interface ApiAdaptor {
  id: string;
  attributes: { name: string; description: string; category: string };
}

interface ApiSuggestion {
  attributes: { name: string; description: string; adaptor: string | null };
}

interface ApiEcosystem {
  data: {
    attributes: {
      stations: { id: string; name: string; adaptor: string | null; col: number; row: number; kind: EcosystemStation["kind"]; owner: string | null; xroad: EcosystemStation["xroad"] | null }[];
      workflows: {
        id: string;
        name: string;
        project: string;
        trigger: string;
        trigger_detail: string;
        state: EcosystemWorkflow["state"];
        station_ids: string[];
        runs_per_day: number;
        success_rate: number;
        fails_at: number | null;
        failure_reason: string | null;
        note: string | null;
        color: string;
      }[];
      corners: { station_ids: [string, string]; via: { col: number; row: number }[] }[];
    };
  };
}


/** Every connected system, by name. */
export function useConnectedSystems(): { status: LoadStatus; systems: ConnectedSystem[] } {
  const query = useQuery({
    queryKey: systemKeys.all,
    queryFn: () => listAll<ApiSystem>("/api/demo/connected_systems"),
    select: (rows) => rows.map(({ id, attributes }) => ({ ...attributes, id })),
  });
  return { status: statusOf(query), systems: query.data ?? none };
}

/** An access grant as the demo's grants route sends it. */
interface ApiAccessGrant {
  id: string;
  attributes: { granted_to: string; granted_to_type: AccessGrant["grantedToType"]; scope: string; last_accessed: string | null };
}

/** Who has access to a system. */
export function useAccessGrants(systemId: string | undefined): { status: LoadStatus; grants: AccessGrant[] } {
  const query = useQuery({
    queryKey: systemKeys.grants(systemId ?? ""),
    enabled: !!systemId,
    queryFn: () => listAll<ApiAccessGrant>(`/api/demo/connected_systems/${systemId}/access_grants`),
    select: (rows): AccessGrant[] =>
      rows.map(({ id, attributes: a }) => ({ id, grantedTo: a.granted_to, grantedToType: a.granted_to_type, scope: a.scope, lastAccessed: a.last_accessed })),
  });
  return { status: systemId ? statusOf(query) : { state: "ready" }, grants: query.data ?? none };
}

/** What adding a system asks for. */
export interface SystemDraft {
  name: string;
  description: string;
  adaptor: string;
  endpointUrl?: string;
  docsUrl?: string;
}

/** Adding, editing, removing and revoking access to systems. Each resolves once the systems have reloaded. */
export function useSystemSaves() {
  const queryClient = useQueryClient();
  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: systemKeys.all }), queryClient.invalidateQueries({ queryKey: ["audit_events"] })]);
  const run = useMutation({ mutationFn: (work: () => Promise<unknown>) => work(), onSuccess: refresh });
  const go = <T,>(work: () => Promise<T>) => run.mutateAsync(work) as Promise<T>;
  const blank = { url: "", credential: "" };
  return {
    /** Adds a system; answers with its id. */
    add: (draft: SystemDraft) =>
      go(async () => {
        const id = crypto.randomUUID();
        await request("PUT", `/api/demo/connected_systems/${id}`, {
          name: draft.name,
          description: draft.description,
          adaptor: draft.adaptor,
          ...(draft.docsUrl && { apiDocsUrl: draft.docsUrl }),
          environments: { production: { ...blank, url: draft.endpointUrl ?? "" }, staging: blank, mock: blank },
        });
        return id;
      }),
    /** Adds a system from what the X-Road directory says about a service. */
    addFromXRoad: (system: Omit<ConnectedSystem, "id">) =>
      go(async () => {
        const id = crypto.randomUUID();
        await request("PUT", `/api/demo/connected_systems/${id}`, system);
        return id;
      }),
    /** Saves changes to a system's details and, for a direct one, where it lives; each environment keeps its credential. */
    edit: (system: ConnectedSystem, changes: SystemChanges) =>
      go(() =>
        request("PUT", `/api/demo/connected_systems/${system.id}`, {
          name: changes.name,
          description: changes.description,
          apiDocsUrl: changes.docsUrl,
          ...(changes.urls && {
            environments: Object.fromEntries(
              Object.entries(system.environments).map(([env, value]) => [env, { ...value, url: changes.urls![env as keyof typeof changes.urls].trim() }]),
            ),
          }),
        }),
      ).then(() => undefined),
    remove: (id: string) => go(() => request("DELETE", `/api/demo/connected_systems/${id}`)).then(() => undefined),
    revokeGrant: (systemId: string, grantId: string) =>
      go(async () => {
        await request("DELETE", `/api/demo/connected_systems/${systemId}/access_grants/${grantId}`);
        await queryClient.invalidateQueries({ queryKey: systemKeys.grants(systemId) });
      }),
  };
}

/** Every adaptor a system can be connected with. Loads nothing while `enabled` is false. */
export function useAdaptors(enabled = true): { status: LoadStatus; adaptors: Adaptor[] } {
  const query = useQuery({
    queryKey: ["adaptors"],
    enabled,
    queryFn: () => listAll<ApiAdaptor>("/api/demo/adaptors"),
    select: (rows): Adaptor[] => rows.map(({ id, attributes: a }) => ({ id, name: a.name, description: a.description, category: a.category })),
    staleTime: Infinity,
  });
  return enabled ? { status: statusOf(query), adaptors: query.data ?? none } : { status: { state: "ready" }, adaptors: none };
}

/** Systems the organisation might connect next, leaving out any it already has. Loads nothing while `enabled` is false. */
export function useSystemSuggestions(enabled = true): { status: LoadStatus; suggestions: SuggestedSystem[] } {
  const query = useQuery({
    queryKey: systemKeys.suggestions,
    enabled,
    queryFn: () => listAll<ApiSuggestion>("/api/demo/connected_systems/suggestions"),
    select: (rows): SuggestedSystem[] => rows.map(({ attributes: a }) => ({ name: a.name, description: a.description, adaptor: a.adaptor ?? undefined })),
  });
  return enabled ? { status: statusOf(query), suggestions: query.data ?? none } : { status: { state: "ready" }, suggestions: none };
}

/** The organisation's ecosystem map. Loads nothing while `enabled` is false. */
export function useEcosystem(enabled = true): { status: LoadStatus; ecosystem: Ecosystem | undefined } {
  const query = useQuery({
    queryKey: systemKeys.ecosystem,
    enabled,
    queryFn: () => request<ApiEcosystem>("GET", "/api/demo/ecosystem"),
    select: ({ data: { attributes: a } }): Ecosystem => ({
      stations: a.stations.map((s) => ({
        id: s.id,
        name: s.name,
        adaptor: s.adaptor ?? undefined,
        col: s.col,
        row: s.row,
        kind: s.kind,
        owner: s.owner ?? undefined,
        xroad: s.xroad ?? undefined,
      })),
      workflows: a.workflows.map((w) => ({
        id: w.id,
        name: w.name,
        project: w.project,
        // A kind or colour the app doesn't know is drawn as a webhook, in the first colour.
        trigger: w.trigger in triggerTypes ? (w.trigger as TriggerType) : "webhook",
        triggerDetail: w.trigger_detail,
        state: w.state,
        stations: w.station_ids,
        runsPerDay: w.runs_per_day,
        successRate: w.success_rate,
        failsAt: w.fails_at ?? undefined,
        failureReason: w.failure_reason ?? undefined,
        note: w.note ?? undefined,
        color: (lineColors as readonly string[]).includes(w.color) ? (w.color as LineColor) : lineColors[0],
      })),
      routes: Object.fromEntries(a.corners.map((c) => [linkId(c.station_ids[0], c.station_ids[1]), c.via])),
    }),
  });
  return enabled ? { status: statusOf(query), ecosystem: query.data } : { status: { state: "ready" }, ecosystem: undefined };
}

/** What the organisation's systems offer to workflows. Loads nothing while `enabled` is false. */
export function useSystemChannels(enabled = true): { status: LoadStatus; channels: SystemChannel[] } {
  const query = useQuery({
    queryKey: systemKeys.channels,
    enabled,
    queryFn: () => listAll<ApiSystemChannel>("/api/demo/connected_systems/channels"),
    select: (rows): SystemChannel[] =>
      rows.map(({ id, attributes: a, relationships: r }) => ({
        id,
        name: a.name,
        description: a.description,
        channelType: a.channel_type,
        systemId: r.connected_system.data.id,
        section: a.section,
      })),
  });
  return enabled ? { status: statusOf(query), channels: query.data ?? none } : { status: { state: "ready" }, channels: none };
}

