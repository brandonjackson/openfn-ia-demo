/**
 * Every id the API sends is a UUID (api/conventions.md). The fixtures name
 * their records with readable slugs ("project-a"), so the fake server gives
 * each one a UUID worked out from its kind and slug: the same on every load,
 * so links and stored data keep pointing at the same record.
 */

// cyrb53: a small, well-spread string hash. Two seeds give the 128 bits a UUID needs.
function cyrb53(text: string, seed: number): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

const hex = (n: number, length: number) => n.toString(16).padStart(length, "0").slice(-length);

/** The UUID a fixture record of this kind and slug has on the fake server (`seedId("project", "project-a")`). */
export function seedId(kind: string, slug: string): string {
  const text = `${kind}:${slug}`;
  const a = hex(cyrb53(text, 1), 14) + hex(cyrb53(text, 2), 14) + hex(cyrb53(text, 3), 4);
  // Version 5 and the RFC 4122 variant, so it reads as a name-based UUID.
  const variant = ((parseInt(a[16]!, 16) & 0x3) | 0x8).toString(16);
  return `${a.slice(0, 8)}-${a.slice(8, 12)}-5${a.slice(13, 16)}-${variant}${a.slice(17, 20)}-${a.slice(20, 32)}`;
}

/** A new id for a record made on the fake server. */
export const newId = () => crypto.randomUUID();

/** A fixture workflow's id on the API, from its slug ("planning-application-workflow"). */
export const apiWorkflowId = (slug: string) => seedId("workflow", slug);

/** A seeded workflow's step, trigger or edge id on the API, from its workflow's slug and its id in the fixture graph. */
export const apiNodeId = (workflowSlug: string, nodeId: string) => seedId("node", `${workflowSlug}/${nodeId}`);

/** A step's id in a sandbox's copy of a workflow, from the sandbox and the step it was copied from. */
export const cloneNodeId = (sandboxId: string, nodeId: string) => seedId("clone", `${sandboxId}/${nodeId}`);

/** A fixture channel's id on the API, from its project's slug and its own. */
export const apiChannelId = (projectSlug: string, slug: string) => seedId("channel", `${projectSlug}/${slug}`);

/** A fixture form, artifact, AI skill, document or static website's id on the API, from its project's slug and its own. */
export const apiComponentId = (projectSlug: string, slug: string) => seedId("component", `${projectSlug}/${slug}`);

/** A fixture collection's id on the API, from its project's slug and its name. */
export const apiCollectionId = (projectSlug: string, name: string) => seedId("collection", `${projectSlug}/${name}`);

/** A fixture connected system's id on the API, from its slug ("dhis2"). */
export const apiSystemId = (slug: string) => seedId("connected_system", slug);

/** A fixture service's id on the API, from its project's slug and its own. */
export const apiServiceId = (projectSlug: string, slug: string) => seedId("service", `${projectSlug}/${slug}`);
