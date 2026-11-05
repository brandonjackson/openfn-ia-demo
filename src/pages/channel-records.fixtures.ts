import type { ChannelRecord } from "../app/channel-state";
import type { ChannelDraft } from "../model/channels";
import type { Project } from "../model/projects";
import { channelDetails, channelEventAddress, newChannelDetails } from "../fixtures/channels";

/*
 * Making and changing a project's channels from fixtures, shared by the
 * Channels list's wrapper and each channel page's.
 */

/** A project's channels as the fixtures have them. */
export function fixtureChannels(project: Project): ChannelRecord[] {
  return project.components.filter((c) => c.type === "Channel").map((component) => ({ component, details: channelDetails(component) }));
}

/** A channel's name as the id in its address: lower case, hyphenated. */
export function channelId(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** A new channel, from a draft. */
export function createChannel(project: Project, draft: ChannelDraft): ChannelRecord {
  const id = channelId(draft.name);
  return {
    component: { id, name: draft.name.trim(), description: draft.description.trim(), type: "Channel" },
    details: newChannelDetails(project.id, id, draft),
  };
}

/** A channel changed by an edit, keeping its traffic. */
export function editChannel(record: ChannelRecord, draft: ChannelDraft): ChannelRecord {
  const event = record.details.channelType === "event";
  return {
    component: { ...record.component, name: draft.name.trim(), description: draft.description.trim() },
    details: {
      ...record.details,
      system: { ...record.details.system, name: draft.system },
      endpoint: event ? record.details.endpoint : draft.destinationUrl,
      credential: draft.credential,
      enabled: draft.enabled,
    },
  };
}

/** The draft an edit starts from. */
export function channelDraft(record: ChannelRecord): ChannelDraft {
  return {
    name: record.component.name,
    description: record.component.description,
    channelType: record.details.channelType,
    system: record.details.system.name,
    destinationUrl: record.details.channelType === "event" ? "" : record.details.endpoint,
    credential: record.details.credential,
    enabled: record.details.enabled ?? true,
  };
}

export { channelEventAddress };
