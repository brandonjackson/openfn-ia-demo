/**
 * A sandbox is a copy of its project: its workflows, and its components and
 * environment variables too. Each table that a sandbox copies seeds the
 * fixtures' sandboxes with `withSandboxCopies`, the same copy that making a
 * sandbox does (sandboxes.ts), so a seeded sandbox looks like one made in the
 * demo.
 */
import { fixtureSandboxes } from "./projects";

/**
 * `rows` with each fixture sandbox's copy of its parent's rows added, made by
 * `copy`. A sandbox made from another sandbox copies that one's, so parents
 * are copied first.
 */
export function withSandboxCopies<T extends { project_id: string }>(rows: T[], copy: (row: T, sandboxId: string) => T): T[] {
  const all = [...rows];
  const pending = fixtureSandboxes();
  const sandboxIds = new Set(pending.map((s) => s.id));
  const done = new Set<string>();
  while (pending.length) {
    const next = pending.findIndex((s) => !sandboxIds.has(s.parentId) || done.has(s.parentId));
    if (next < 0) break;
    const [s] = pending.splice(next, 1);
    all.push(...all.filter((r) => r.project_id === s!.parentId).map((r) => copy(r, s!.id)));
    done.add(s!.id);
  }
  return all;
}

/**
 * One of a sandbox's things paired with the target's, as a merge preview and
 * a merge see it: a workflow's doc or test, a saved dataclip, a component or
 * an environment variable. Everything a sandbox keeps is paired this way, so
 * the preview says what's new or changed, and a merge brings exactly that
 * back (`apply`), never deleting the target's.
 */
export interface CopyPair {
  /** Its name, or a variable's key. */
  name: string;
  /** Whether the target has none to pair it with. */
  isNew: boolean;
  /** Whether the target's is the same. */
  same: boolean;
  /** Brings it into the target: makes it there, or changes the target's to match. */
  apply: () => void;
}

/** What a merge preview says of a pair. */
export const changeOf = (p: Pick<CopyPair, "isNew" | "same">): "new" | "changed" | "unchanged" => (p.isNew ? "new" : p.same ? "unchanged" : "changed");
