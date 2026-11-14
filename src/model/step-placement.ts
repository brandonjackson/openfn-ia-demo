import type { Workflow } from "./workflow";

/** How far apart steps sit on the canvas: one row down, or one branch across. */
export const ROW_GAP = 170;
export const BRANCH_GAP = 320;

type Point = { x: number; y: number };

/** Every node reachable from `id` along the workflow's edges, `id` included. */
function reachableFrom(workflow: Workflow, id: string): Set<string> {
  const seen = new Set<string>();
  const queue = [id];
  while (queue.length) {
    const next = queue.shift()!;
    if (seen.has(next)) continue;
    seen.add(next);
    for (const e of workflow.edges) if (e.source === next) queue.push(e.target);
  }
  return seen;
}

/**
 * Where a step added after `sourceId` goes, and where its new siblings move to.
 *
 * The first step after a node goes straight below it. A later one is a new branch: it goes to the right of the
 * other children, then the children are shifted together, each with the steps only it leads to, so the row of
 * them sits centred under the parent. The children keep their spacing, so two branches that were laid out wide
 * stay wide. Steps reached from more than one child (where branches meet again) stay where they are.
 */
export function placeAfter(workflow: Workflow, sourceId: string): { position: Point; moves: Record<string, Point> } {
  const source = workflow.nodes.find((n) => n.id === sourceId);
  if (!source) return { position: { x: 0, y: 0 }, moves: {} };
  const childIds = [...new Set(workflow.edges.filter((e) => e.source === sourceId).map((e) => e.target))];
  const children = childIds.flatMap((id) => workflow.nodes.find((n) => n.id === id) ?? []);
  const y = source.y + ROW_GAP;

  if (!children.length) {
    let x = source.x;
    while (workflow.nodes.some((n) => Math.abs(n.x - x) < BRANCH_GAP - 20 && Math.abs(n.y - y) < ROW_GAP - 40)) x += BRANCH_GAP;
    return { position: { x, y }, moves: {} };
  }

  const newX = Math.max(...children.map((c) => c.x)) + BRANCH_GAP;
  const xs = [...children.map((c) => c.x), newX];
  const dx = source.x - (Math.min(...xs) + Math.max(...xs)) / 2;
  const position = { x: newX + dx, y };
  if (dx === 0) return { position, moves: {} };

  // Each child moves with the steps only it leads to; a step two branches share stays put.
  const subtrees = children.map((c) => reachableFrom(workflow, c.id));
  const counts = new Map<string, number>();
  for (const tree of subtrees) for (const id of tree) counts.set(id, (counts.get(id) ?? 0) + 1);
  const moved = new Set(subtrees.flatMap((tree) => [...tree].filter((id) => counts.get(id) === 1 && id !== sourceId)));
  const moves = Object.fromEntries(
    workflow.nodes.filter((n) => moved.has(n.id) && n.type === "job").map((n) => [n.id, { x: n.x + dx, y: n.y }]),
  );
  return { position, moves };
}
