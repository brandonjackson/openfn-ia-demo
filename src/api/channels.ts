/** Channels and their requests on Lightning's API (api/channels.md): shapes, mappers, keys and hooks. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChannelDetails, ChannelDraft, ChannelMessage } from "../model/channels";
import type { ProjectComponent } from "../model/projects";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";

/** A channel as the API sends it, with the demo's extra fields. */
interface ApiChannel {
  id: string;
  attributes: {
    name: string;
    destination_url: string;
    enabled: boolean;
    lock_version: number;
    url: string;
    client_auth_method_ids: string[];
    destination_credential_id: string | null;
    request_count: number;
    description: string;
    channel_type: ChannelDetails["channelType"];
    system: { name: string; adaptor: string };
    method: "GET" | "POST";
    auth: string;
    payload: string;
    days: ChannelDetails["days"];
    median_ms: number;
    workflow_id: string | null;
  };
}

interface ApiChannelRequest {
  id: string;
  attributes: { channel_id: string; request_id: string; status: number; duration_ms: number; summary: string; run_id: string | null; body: string; at: string };
}

/** A channel as the project holds it: the component in its lists, what it carries, and what a save needs back. */
export interface ChannelResource {
  component: ProjectComponent;
  details: ChannelDetails;
  lockVersion: number;
  /** The project credential it calls its system with, by the link's id. */
  credentialLinkId: string | null;
}

export const channelKeys = { inProject: (projectId: string) => ["channels", projectId] as const };

/**
 * A project's channels, each with its recent messages. `credentialName`
 * names a project credential link, for the form, which picks credentials
 * by name.
 */
export function useChannels(projectId: string | undefined, credentialName: (linkId: string) => string | undefined = () => undefined): { status: LoadStatus; channels: ChannelResource[] } {
  const query = useQuery({
    queryKey: channelKeys.inProject(projectId ?? ""),
    enabled: !!projectId,
    queryFn: async () => {
      const [list, requests] = await Promise.all([
        listAll<ApiChannel>(`/api/projects/${projectId}/channels`),
        listAll<ApiChannelRequest>(`/api/projects/${projectId}/channel_requests`),
      ]);
      return { list, requests };
    },
  });
  const channels = (query.data?.list ?? []).map(({ id, attributes: a }): ChannelResource => {
    const messages: ChannelMessage[] = (query.data?.requests ?? [])
      .filter((r) => r.attributes.channel_id === id)
      .map((r) => ({
        id: r.attributes.request_id,
        at: r.attributes.at,
        status: r.attributes.status,
        durationMs: r.attributes.duration_ms,
        summary: r.attributes.summary,
        ...(r.attributes.run_id && { runId: r.attributes.run_id }),
        body: r.attributes.body,
      }));
    return {
      component: { id, name: a.name, description: a.description, type: "Channel" },
      details: {
        channelType: a.channel_type,
        system: a.system,
        method: a.method,
        // A read or write channel calls its destination; an event channel's is the address it listens at.
        endpoint: a.destination_url,
        auth: a.auth,
        payload: a.payload,
        days: a.days,
        medianMs: a.median_ms,
        messages,
        ...(a.workflow_id && { workflowId: a.workflow_id }),
        enabled: a.enabled,
        ...(a.destination_credential_id && { credential: credentialName(a.destination_credential_id) }),
      },
      lockVersion: a.lock_version,
      credentialLinkId: a.destination_credential_id,
    };
  });
  return { status: projectId ? statusOf(query) : { state: "ready" }, channels };
}

/**
 * Making, changing, switching and deleting channels. `credentialLink` finds
 * a project credential link by the name the form picked. Each resolves once
 * the channels have reloaded; a refusal names its field (`name`,
 * `destination_url`), or is a 409 `concurrent_edit` when someone else
 * changed it first.
 */
export function useChannelSaves(projectId: string, credentialLink: (name: string) => string | undefined) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: channelKeys.inProject(projectId) });
  const put = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => request<{ data: ApiChannel }>("PUT", `/api/projects/${projectId}/channels/${id}`, body),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: (id: string) => request("DELETE", `/api/projects/${projectId}/channels/${id}`), onSuccess: refresh });
  const body = (draft: ChannelDraft, eventAddress: string) => ({
    name: draft.name.trim(),
    description: draft.description.trim(),
    channel_type: draft.channelType,
    system: { name: draft.system, adaptor: "http" },
    method: draft.channelType === "read" ? "GET" : "POST",
    // An event channel listens; the API still wants a destination, so it's the channel's own address.
    destination_url: draft.channelType === "event" ? eventAddress : draft.destinationUrl,
    auth: draft.channelType === "event" ? "API key in the x-api-key header" : draft.credential ? `Project credential: ${draft.credential}` : "None",
    destination_credential_id: (draft.credential && credentialLink(draft.credential)) ?? null,
    enabled: draft.enabled,
  });
  return {
    /** Makes a channel; answers with its id. */
    create: async (draft: ChannelDraft, eventAddress: string) => {
      const id = crypto.randomUUID();
      await put.mutateAsync({ id, body: body(draft, eventAddress) });
      return id;
    },
    update: async (channel: ChannelResource, draft: ChannelDraft) =>
      void (await put.mutateAsync({ id: channel.component.id, body: { ...body(draft, channel.details.endpoint), lock_version: channel.lockVersion } })),
    setEnabled: async (channel: ChannelResource, enabled: boolean) =>
      void (await put.mutateAsync({ id: channel.component.id, body: { enabled, lock_version: channel.lockVersion } })),
    remove: async (id: string) => void (await remove.mutateAsync(id)),
  };
}
