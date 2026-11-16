import { useSyncExternalStore } from "react";
import { useProject } from "../api/projects";
import { useSandboxes } from "../api/workflows";
import { combine, type LoadStatus } from "../api/status";
import type { ProjectDetails } from "../model/projects";

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

/**
 * The project a page inside `rootId` shows: the sandbox selected in the
 * project bar, or the project itself on main (or when that sandbox is gone).
 * Lists that a sandbox has its own copy of (its workflows) read from this, so
 * what you make in a sandbox is in its lists.
 */
export function useSelectedProject(rootId: string | undefined): { status: LoadStatus; project: ProjectDetails | undefined; root: ProjectDetails | undefined } {
  const [selected] = useSandbox(rootId ?? "");
  const { status: rootStatus, project: root } = useProject(rootId);
  const { status: sandboxStatus, sandboxes } = useSandboxes(rootId);
  const sandbox = selected === "main" ? undefined : sandboxes.find((s) => s.name === selected && !s.scheduledDeletion);
  return { status: combine(rootStatus, sandboxStatus), project: sandbox ?? root, root };
}
