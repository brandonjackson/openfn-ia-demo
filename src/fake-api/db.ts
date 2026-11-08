/**
 * The fake server's database: one table per resource, each seeded from the
 * fixtures in src/fixtures/. Every write is kept in localStorage, so what you
 * make, change or delete in the demo is still there after a reload. A change
 * to the fixtures changes the seed, and the next load starts from it again.
 * `resetDb()` (the demo's "Reset demo data") goes back to the seed.
 *
 * Beside a real Lightning the fake server only answers the demo's own routes,
 * and mixing the fixtures in with Lightning's data would make it impossible to
 * tell which is which. So there `seedEmpty()` starts every table empty, apart
 * from the few that are vocabulary rather than records (a table's `empty`
 * seed), and keeps it under its own key, so the fixtures' data in the same
 * browser is left alone.
 */
import { msAgo } from "../model/time";

let STORAGE_KEY = "openfn-demo:db";

/** Whether tables start from the fixtures or, beside Lightning, empty. */
let seeding: "fixtures" | "empty" = "fixtures";

interface Table<T> {
  seed: () => T[];
  /** The seed beside Lightning, when it isn't empty. */
  empty?: () => T[];
  rows: T[] | undefined;
}

/** The seed a table starts from now. */
const seedOf = <T>(t: Table<T>): T[] => (seeding === "fixtures" ? t.seed() : (t.empty?.() ?? []));

const tables = new Map<string, Table<unknown>>();

interface Stored {
  seed: string;
  /** When the stored data was seeded: the moment its "12 minutes ago"s count back from. */
  seededAt?: number;
  tables: Record<string, unknown[]>;
}

// The moment seeds count back from. Fixed while fingerprinting, so the fingerprint only
// changes when the fixtures do; otherwise the moment the data was first seeded.
let seededAt = Date.now();

/** A seed's timestamp: this long before the data was seeded, whole seconds, UTC. */
export function ago(ms: number): string {
  return new Date(seededAt - ms).toISOString().replace(/\.\d+Z$/, "Z");
}

/**
 * A fixture's relative time ("12 minutes ago", "Yesterday", "Just now") as a
 * seed timestamp; a date ("14 Mar 2024") as itself. Anything else is `fallback` ago.
 */
export function seedTime(text: string | undefined, fallback = 86_400_000): string {
  const relative = msAgo(text);
  if (relative !== null) return ago(relative);
  const parsed = Date.parse(`${text} UTC`);
  if (text && !Number.isNaN(parsed)) return new Date(parsed).toISOString().replace(/\.\d+Z$/, "Z");
  return ago(fallback);
}

let stored: Stored | null | undefined;

function storage(): Storage | undefined {
  try {
    return typeof localStorage === "undefined" ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

// A fingerprint of every table's seed, so data saved against old fixtures is dropped.
let fingerprint: string | undefined;
let fingerprinting = false;
function seedFingerprint(): string {
  if (fingerprint) return fingerprint;
  const clock = seededAt;
  seededAt = 0;
  fingerprinting = true;
  let text: string;
  try {
    text = JSON.stringify([...tables.entries()].map(([name, t]) => [name, seedOf(t)]));
  } finally {
    fingerprinting = false;
    seededAt = clock;
  }
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  fingerprint = `${seeding}:${tables.size}:${text.length}:${h}`;
  return fingerprint;
}

function load(): Stored | null {
  if (stored !== undefined) return stored;
  stored = null;
  const raw = storage()?.getItem(STORAGE_KEY);
  if (!raw) return stored;
  try {
    const parsed = JSON.parse(raw) as Stored;
    if (parsed.seed === seedFingerprint()) {
      stored = parsed;
      seededAt = parsed.seededAt ?? seededAt;
    }
  } catch {
    // Unreadable: start from the seed.
  }
  return stored;
}

let pending = false;
function save() {
  if (pending) return;
  pending = true;
  queueMicrotask(() => {
    pending = false;
    const store = storage();
    if (!store) return;
    const data: Stored = { seed: seedFingerprint(), seededAt, tables: {} };
    // A table not read this session keeps what was stored for it.
    for (const [name, t] of tables) {
      const rows = t.rows ?? stored?.tables[name];
      if (rows) data.tables[name] = rows;
    }
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Full or blocked: the change lasts until the page reloads.
    }
  });
}

/**
 * A table of records. `rows()` reads, `write()` replaces them all (and saves).
 * Records are plain JSON, stored the way the API sends them. Beside Lightning
 * it starts empty, or from `empty` for a table of vocabulary rather than
 * records (the starter ideas).
 */
export function table<T>(name: string, seed: () => T[], { empty }: { empty?: () => T[] } = {}) {
  if (tables.has(name)) throw new Error(`Table ${name} is defined twice`);
  const t: Table<T> = { seed, empty, rows: undefined };
  tables.set(name, t as Table<unknown>);
  fingerprint = undefined;

  const rows = (): T[] => {
    // A seed that reads another table mustn't leave it cached with the fingerprint's clock.
    if (fingerprinting) return seedOf(t);
    if (!t.rows) t.rows = ((load()?.tables[name] as T[] | undefined) ?? seedOf(t)).map((r) => structuredClone(r));
    return t.rows;
  };
  const write = (next: T[]) => {
    t.rows = next;
    save();
  };
  return {
    rows,
    write,
    /** Adds a record at the end. */
    insert: (row: T) => write([...rows(), row]),
    /** Changes the records that match, in place. */
    update: (match: (row: T) => boolean, change: (row: T) => T) => write(rows().map((r) => (match(r) ? change(r) : r))),
    /** Removes the records that match. */
    remove: (match: (row: T) => boolean) => write(rows().filter((r) => !match(r))),
  };
}

/** Back to the seed: forgets every change, here and in localStorage. */
export function resetDb() {
  for (const t of tables.values()) t.rows = undefined;
  seededAt = Date.now();
  stored = null;
  storage()?.removeItem(STORAGE_KEY);
}

/** Whether the tables started empty, beside Lightning. */
export const seededEmpty = () => seeding === "empty";

/**
 * Starts every table empty, for the demo's own routes beside a real Lightning
 * (src/api/source.ts), kept apart from the fixtures' data in this browser.
 * `fixtures` goes back, for tests.
 */
export function seedEmpty(on = true) {
  seeding = on ? "empty" : "fixtures";
  STORAGE_KEY = on ? "openfn-demo:db:lightning" : "openfn-demo:db";
  for (const t of tables.values()) t.rows = undefined;
  fingerprint = undefined;
  stored = undefined;
  seededAt = Date.now();
}
