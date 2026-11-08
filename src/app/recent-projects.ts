import { useSyncExternalStore } from "react";
import { recentProjects as seedRecent, apiProjectId } from "../fixtures/projects";
import { apiSource } from "../api/source";

/**
 * The projects you opened most recently, newest first, by id: the sidebar's
 * list and the project switcher's shortlist. The browser keeps it, as
 * Lightning's app would; the API has no such list. Starts from the
 * fixtures' recent projects, or, on Lightning, empty, kept apart so the two
 * sources' ids never mix.
 */
const STORAGE_KEY = apiSource === "lightning" ? "openfn-demo:recent-projects:lightning" : "openfn-demo:recent-projects";
const MAX = 8;

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    // Unreadable or blocked: start afresh.
  }
  return apiSource === "lightning" ? [] : seedRecent.map((p) => apiProjectId(p.id));
}

let recent = load();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Puts a project at the top of the recent list. */
export function noteOpened(id: string) {
  if (recent[0] === id) return;
  recent = [id, ...recent.filter((r) => r !== id)].slice(0, MAX);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch {
    // The list still holds for this session.
  }
  listeners.forEach((l) => l());
}

export function useRecentProjectIds(): string[] {
  return useSyncExternalStore(subscribe, () => recent);
}
