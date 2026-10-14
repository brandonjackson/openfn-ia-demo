/**
 * Behaviour annotations, read from the copy of Lightning's `annotations/`
 * folder at the repo root (see annotations/SOURCE.md for which commit).
 * Vite bundles the markdown at build time; nothing is fetched at runtime.
 */

export const ANNOTATIONS_REPO = "OpenFn/lightning";
export const ANNOTATIONS_BRANCH = "claude/tender-mendel-0pejfc";

const BLOB_BASE = `https://github.com/${ANNOTATIONS_REPO}/blob/${ANNOTATIONS_BRANCH}/annotations`;

/** Folders an annotation id can live in, tried in this order. */
const FOLDERS = ["views", "shared", "flows", "capabilities"] as const;

const files = import.meta.glob<string>("../../annotations/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function file(path: string): string | undefined {
  return files[`../../annotations/${path}`];
}

export interface Annotation {
  id: string;
  folder: (typeof FOLDERS)[number];
  /** Link to the file on GitHub (the branch's current version). */
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

/** The annotation for an id, or null when none has been written yet. */
export function getAnnotation(id: string): Annotation | null {
  for (const folder of FOLDERS) {
    const text = file(`${folder}/${id}.md`);
    if (text === undefined) continue;
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
  return null;
}

function parseInventory(text: string): Map<string, InventoryRow> {
  const rows = new Map<string, InventoryRow>();
  let section = "";
  for (const line of text.split("\n")) {
    const heading = line.match(/^## (.+)$/);
    if (heading) section = heading[1].replace(/\s*\(.*$/, "");
    const cells = line.split("|").map((c) => c.trim());
    // | id | Route | Module | Main files | Status |
    if (cells.length >= 7 && /^[a-z0-9-]+$/.test(cells[1]) && cells[1] !== "id") {
      rows.set(cells[1], { id: cells[1], section, route: cells[2], status: cells[cells.length - 2] });
    }
  }
  return rows;
}

/** INVENTORY.md's tables, keyed by view id: where each view lives and how far its annotation has got. */
export const inventory: Map<string, InventoryRow> = parseInventory(file("INVENTORY.md") ?? "");

export function inventoryUrl() {
  return `${BLOB_BASE}/INVENTORY.md`;
}
