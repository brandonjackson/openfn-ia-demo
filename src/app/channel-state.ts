import { useSyncExternalStore } from "react";
import type { ProjectComponent } from "../model/projects";
import type { ChannelDetails } from "../model/channels";

/** A channel as the project holds it: the component and what it carries. */
export interface ChannelRecord {
  component: ProjectComponent;
  details: ChannelDetails;
}

/**
 * Each project's channels as changed this session (made, edited, turned off
 * or deleted): the fixtures' stand-in for the server, shared by the project's
 * Channels list and each channel's page. Gone on reload.
 */
let saved: Record<string, ChannelRecord[]> = {};
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Saves a project's channels as they are now. */
export function saveChannels(projectId: string, channels: ChannelRecord[]) {
  saved = { ...saved, [projectId]: channels };
  listeners.forEach((l) => l());
}

/** A project's channels as changed this session, or nothing when they haven't been. */
export function useSavedChannels(projectId: string): ChannelRecord[] | undefined {
  return useSyncExternalStore(subscribe, () => saved[projectId]);
}
