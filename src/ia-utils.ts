import type { IANode } from "./ia-tree";

export interface LookupResult {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  /** Map of template node IDs to the actual URL slugs they matched */
  params: Record<string, string>;
}

export function findNodeByPath(
  tree: IANode[],
  pathname: string
): LookupResult | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  let currentLevel = tree;
  const ancestors: { node: IANode; path: string }[] = [];
  const params: Record<string, string> = {};
  let pathSoFar = "";

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    let found = currentLevel.find((n) => n.id === seg);

    // If no exact match, fall back to a dynamic template child
    if (!found) {
      const dynamicNode = currentLevel.find((n) => n.dynamic);
      if (dynamicNode) {
        found = dynamicNode;
        params[dynamicNode.id] = seg;
      } else {
        return null;
      }
    }

    pathSoFar += "/" + seg;

    if (i === segments.length - 1) {
      return { node: found, ancestors, params };
    }

    ancestors.push({ node: found, path: pathSoFar });
    currentLevel = found.children || [];
  }

  return null;
}

export function buildPath(ancestors: { path: string }[], nodeId: string): string {
  if (ancestors.length === 0) return "/" + nodeId;
  return ancestors[ancestors.length - 1].path + "/" + nodeId;
}

export function getNodePath(tree: IANode[], targetId: string, prefix = ""): string | null {
  for (const node of tree) {
    const path = prefix + "/" + node.id;
    if (node.id === targetId) return path;
    if (node.children) {
      const found = getNodePath(node.children, targetId, path);
      if (found) return found;
    }
  }
  return null;
}
