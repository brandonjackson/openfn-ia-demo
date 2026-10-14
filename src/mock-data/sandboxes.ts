/**
 * The sandboxes page's view of the project tree (Lightning's
 * `SandboxLive.Index` decorates each project with an env badge, deletion
 * state and per-sandbox permissions). Built on projects.ts, plus one sandbox
 * scheduled for deletion so that section renders.
 */
import { findProject, projects, type Project } from "./projects";

export interface SandboxRow {
  id: string;
  name: string;
  color: string | null;
  parentId: string | null;
  /** Environment label, e.g. "staging". Shown as a badge when set. */
  env: string | null;
  scheduledDeletion: string | null;
  canEdit: boolean;
  canDelete: boolean;
  canMerge: boolean;
}

/** Lightning's sandbox colour palette (`SandboxLive.Components.@color_palette`). */
export const sandboxColorPalette = [
  "#870d4c",
  "#E33D63",
  "#E64A2E",
  "#F39B33",
  "#F4C644",
  "#fcde32",
  "#d6e819",
  "#9AD04E",
  "#E040FB",
  "#8E3FB1",
  "#5E3FB8",
  "#5AA1F0",
  "#68d6e2",
  "#4AC1CE",
  "#2E9B92",
  "#56B15A",
];

const envs: Record<string, string> = {
  "8c1d2e3f-4a5b-4c6d-9e7f-0a1b2c3d4e5f": "staging",
};

const scheduled: SandboxRow[] = [
  {
    id: "2b3c4d5e-6f70-4a81-92b3-c4d5e6f70a81",
    name: "old-import-test",
    color: "#5AA1F0",
    parentId: "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa",
    env: null,
    scheduledDeletion: "2026-10-21T00:00:00Z",
    canEdit: true,
    canDelete: true,
    canMerge: true,
  },
];

function toRow(p: Project): SandboxRow {
  return {
    id: p.id,
    name: p.name,
    color: p.color,
    parentId: p.parentId,
    env: envs[p.id] ?? null,
    scheduledDeletion: null,
    canEdit: true,
    canDelete: true,
    canMerge: true,
  };
}

/** The top of the tree the current project sits in. */
export function rootOf(projectId: string): Project | undefined {
  let p = findProject(projectId);
  while (p?.parentId) p = findProject(p.parentId);
  return p;
}

/** Every sandbox under `rootId`, at any depth, including scheduled ones. */
export function sandboxRowsUnder(rootId: string): SandboxRow[] {
  const out: SandboxRow[] = [];
  const walk = (parentId: string) => {
    for (const p of projects.filter((x) => x.parentId === parentId)) {
      out.push(toRow(p));
      walk(p.id);
    }
    for (const s of scheduled.filter((x) => x.parentId === parentId)) out.push(s);
  };
  walk(rootId);
  return out;
}

export function findSandboxRow(id: string | undefined): SandboxRow | undefined {
  const p = findProject(id);
  if (p) return toRow(p);
  return scheduled.find((s) => s.id === id);
}

/** Lightning's deletion grace period (`purge_deleted_after_days`). */
export const sandboxGracePeriodLabel = "7 days";
