/**
 * What a channel component looks like when opened from the code explorer:
 * the system it belongs to, the address it listens on or calls, the shape of
 * its messages, and the traffic it has carried over the last week.
 */
import type { ChannelType } from "./page-data";

export interface ChannelMessage {
  id: string;
  /** When it arrived or was sent, as shown, e.g. "20 Oct, 09:52". */
  at: string;
  /** HTTP status the request ended with. */
  status: number;
  durationMs: number;
  /** One line on what the message was about. */
  summary: string;
  /** The run it started or came from, when there is one. */
  runId?: string;
  body: string;
}

export interface ChannelDetails {
  channelType: ChannelType;
  system: { name: string; adaptor: string };
  method: "GET" | "POST";
  /** Where the channel listens (event) or what it calls (read, write). */
  endpoint: string;
  auth: string;
  /** An example message, as JSON. */
  payload: string;
  /** Messages per day over the last 7 days, oldest first. */
  days: { label: string; tick: string; messages: number; errors: number }[];
  medianMs: number;
  messages: ChannelMessage[];
  /** The workflow whose runs the messages started or came from, for loading a run from a message. */
  workflowId?: string;
  /** Off, the channel refuses every request until it's turned back on. On unless set. */
  enabled?: boolean;
  /** The project credential OpenFn signs in to the system with, for a read or write channel. */
  credential?: string;
}

/** What making or editing a channel asks for, as in Lightning. */
export interface ChannelDraft {
  name: string;
  description: string;
  channelType: ChannelType;
  /** The system on the other end. */
  system: string;
  /** For a read or write channel, the address OpenFn forwards requests to. An event channel gets its own. */
  destinationUrl: string;
  /** The project credential to call the system with, if any. */
  credential?: string;
  enabled: boolean;
}

/** Why a channel draft can't be saved, by field, or nothing when it can. `taken` are the names in use. */
export function channelDraftErrors(draft: ChannelDraft, taken: string[]): Partial<Record<"name" | "destinationUrl" | "system", string>> {
  const errors: Partial<Record<"name" | "destinationUrl" | "system", string>> = {};
  const name = draft.name.trim();
  if (!name) errors.name = "Give the channel a name.";
  else if (taken.includes(name)) errors.name = "There's already a channel with this name.";
  if (!draft.system.trim()) errors.system = "Say which system it talks to.";
  if (draft.channelType !== "event" && !/^https?:\/\/[^\s]+\.[^\s]+/.test(draft.destinationUrl.trim()))
    errors.destinationUrl = "Enter the full address, starting with https://.";
  return errors;
}
