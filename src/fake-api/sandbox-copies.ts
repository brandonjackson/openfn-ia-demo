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
