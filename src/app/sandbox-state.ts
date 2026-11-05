import { useSyncExternalStore } from "react";

/**
 * Which sandbox (branch) is selected in each project. The choice sticks as you
 * move around the project, and across reloads, until it's changed back.
 */
const STORAGE_KEY = "openfn-ia-demo:sandboxes";
const DEFAULT_SANDBOX = "main";

function load(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

let selected: Record<string, string> = load();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setSandbox(projectId: string, sandbox: string) {
  selected = { ...selected, [projectId]: sandbox };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the
    // selection still holds for this session.
  }
  listeners.forEach((l) => l());
}

/** The selected sandbox for a project, and a setter for it. */
export function useSandbox(projectId: string): [string, (sandbox: string) => void] {
  const sandbox = useSyncExternalStore(
    subscribe,
    () => selected[projectId] ?? DEFAULT_SANDBOX
  );
  return [sandbox, (next) => setSandbox(projectId, next)];
}
