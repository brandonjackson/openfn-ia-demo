/**
 * Reads behaviour annotations straight from the Lightning branch where
 * they're being written, so the panel shows them as they land. A read-only
 * fetch of static markdown from GitHub; nothing is sent anywhere.
 */

export const ANNOTATIONS_REPO = "OpenFn/lightning";
export const ANNOTATIONS_BRANCH = "claude/tender-mendel-0pejfc";

const RAW_BASE = `https://raw.githubusercontent.com/${ANNOTATIONS_REPO}/${ANNOTATIONS_BRANCH}/annotations`;
const BLOB_BASE = `https://github.com/${ANNOTATIONS_REPO}/blob/${ANNOTATIONS_BRANCH}/annotations`;

/** Folders an annotation id can live in, tried in this order. */
const FOLDERS = ["views", "shared", "flows", "capabilities"] as const;

export interface Annotation {
  id: string;
  folder: (typeof FOLDERS)[number];
  /** Link to the file on GitHub. */
  url: string;
  frontMatter: Record<string, string | string[]>;
  /** Raw YAML front matter, for the "Front matter" disclosure. */
  frontMatterRaw: string;
  body: string;
}

export interface InventoryRow {
  id: string;
  section: string;
  route: string;
  status: string;
}

const annotationCache = new Map<string, Promise<Annotation | null>>();
let inventoryCache: Promise<Map<string, InventoryRow>> | null = null;

/** Clears cached files so the next read refetches (GitHub's raw CDN still caches ~5 min). */
export function clearAnnotationCache() {
  annotationCache.clear();
  inventoryCache = null;
}

/**
 * Pulls the simple keys out of the YAML front matter: scalars (`title: x`)
 * and lists of scalars (`inherits:` followed by `- x` lines). Nested maps
 * are left to the raw view.
 */
function parseFrontMatter(raw: string): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  let listKey: string | null = null;
  for (const line of raw.split("\n")) {
    const top = line.match(/^([a-z_]+):\s*(.*)$/);
    if (top) {
      const [, key, value] = top;
      const v = value.replace(/\s+#.*$/, "").trim();
      if (v === "") {
        listKey = key;
        out[key] = [];
      } else {
        listKey = null;
        out[key] = v === "[]" ? [] : v;
      }
      continue;
    }
    const item = line.match(/^ {2}- (.+)$/);
    if (item && listKey && Array.isArray(out[listKey])) {
      (out[listKey] as string[]).push(item[1].replace(/\s+#.*$/, "").trim());
    } else if (/^\S/.test(line)) {
      listKey = null;
    }
  }
  return out;
}

function parseAnnotation(id: string, folder: Annotation["folder"], text: string): Annotation {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const frontMatterRaw = match ? match[1] : "";
  return {
    id,
    folder,
    url: `${BLOB_BASE}/${folder}/${id}.md`,
    frontMatterRaw,
    frontMatter: parseFrontMatter(frontMatterRaw),
    body: match ? match[2] : text,
  };
}

/** The annotation file for an id, or null when none has been written yet. */
export function loadAnnotation(id: string): Promise<Annotation | null> {
  const cached = annotationCache.get(id);
  if (cached) return cached;
  const promise = (async () => {
    for (const folder of FOLDERS) {
      const res = await fetch(`${RAW_BASE}/${folder}/${id}.md`);
      if (res.ok) return parseAnnotation(id, folder, await res.text());
      if (res.status !== 404) throw new Error(`GitHub returned ${res.status}`);
    }
    return null;
  })();
  annotationCache.set(id, promise);
  promise.catch(() => annotationCache.delete(id));
  return promise;
}

/** INVENTORY.md's tables, keyed by view id: where each view lives and how far its annotation has got. */
export function loadInventory(): Promise<Map<string, InventoryRow>> {
  if (inventoryCache) return inventoryCache;
  inventoryCache = (async () => {
    const res = await fetch(`${RAW_BASE}/INVENTORY.md`);
    if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
    const rows = new Map<string, InventoryRow>();
    let section = "";
    for (const line of (await res.text()).split("\n")) {
      const heading = line.match(/^## (.+)$/);
      if (heading) section = heading[1].replace(/\s*\(.*$/, "");
      const cells = line.split("|").map((c) => c.trim());
      // | id | Route | Module | Main files | Status |
      if (cells.length >= 7 && /^[a-z0-9-]+$/.test(cells[1]) && cells[1] !== "id") {
        rows.set(cells[1], { id: cells[1], section, route: cells[2], status: cells[cells.length - 2] });
      }
    }
    return rows;
  })();
  inventoryCache.catch(() => (inventoryCache = null));
  return inventoryCache;
}

export function inventoryUrl() {
  return `${BLOB_BASE}/INVENTORY.md`;
}
