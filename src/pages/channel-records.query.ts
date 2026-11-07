/*
 * What the .query wrappers share about a project's channels: the channels
 * from the API, with their credentials named as the form picks them, and the
 * saves that go with them.
 */
import { useChannels, useChannelSaves, type ChannelResource } from "../api/channels";
import { useProjectCredentials } from "../api/credentials";
import { type ChannelDraft, channelEventAddress } from "../model/channels";

/** A project's channels and how to change them, with credentials by name both ways. */
export function useProjectChannels(projectId: string | undefined) {
  const { credentials } = useProjectCredentials(projectId);
  const nameOf = (linkId: string) => credentials.find((c) => c.id === linkId)?.name;
  const linkOf = (name: string) => credentials.find((c) => c.name === name)?.id;
  const { status, channels } = useChannels(projectId, nameOf);
  const saves = useChannelSaves(projectId ?? "", linkOf);
  return { status, channels, credentialNames: [...new Set(credentials.map((c) => c.name))], saves };
}

/** The draft an edit starts from. */
export function channelDraft(channel: ChannelResource): ChannelDraft {
  return {
    name: channel.component.name,
    description: channel.component.description,
    channelType: channel.details.channelType,
    system: channel.details.system.name,
    destinationUrl: channel.details.channelType === "event" ? "" : channel.details.endpoint,
    credential: channel.details.credential,
    enabled: channel.details.enabled ?? true,
  };
}

/** Where a new event channel will listen: a URL-safe form of its name in the project's address. */
export const eventAddress = (projectName: string, name: string) =>
  channelEventAddress(projectName, name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "my-channel");
