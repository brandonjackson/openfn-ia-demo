/**
 * The handbook, on the demo's own routes (`/api/demo/handbook`): the
 * organisation's article, in sections, and the files beside it.
 */

/** Inline wiki text: plain strings, or links to other pages in the app. */
export type WikiInline = string | { text: string; to: string };

export type WikiBlock =
  | { type: "paragraph"; content: WikiInline[] }
  | { type: "list"; items: WikiInline[][] }
  /** Label/value rows, e.g. who owns a system and what agreement covers it. */
  | { type: "facts"; rows: { label: string; value: WikiInline[] }[] };

export interface WikiSection {
  id: string;
  title: string;
  blocks: WikiBlock[];
}

export type HandbookFileKind = "pdf" | "doc" | "sheet" | "text" | "image";

export interface HandbookFile {
  id: string;
  name: string;
  kind: HandbookFileKind;
  /** Human-readable size, e.g. "240 KB". */
  size: string;
  /** Size in bytes, used to work out how full the handbook is. */
  bytes: number;
  addedBy: string;
  addedAt: string;
}

/** The whole handbook: its article, who last edited it and when, and its files. */
export interface Handbook {
  /** When the article was last edited, as the page shows it. */
  updatedAt: string;
  /** Who last edited it. */
  updatedBy: string;
  sections: WikiSection[];
  files: HandbookFile[];
  /** Total bytes the handbook can hold across all files. */
  capacityBytes: number;
}
