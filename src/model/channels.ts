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
}
