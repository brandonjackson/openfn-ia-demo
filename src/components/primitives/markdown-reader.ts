/**
 * A small Markdown reader for the `Markdown` primitive: enough of CommonMark
 * and GitHub's tables for the docs people write beside their work. Blocks are
 * ATX headings (`#` to `######`), paragraphs, bulleted and numbered lists
 * (nested by indenting), fenced code, block quotes, rules and pipe tables
 * (with a header row above a `---` separator, or without one, when each row
 * is a label and its detail). Inline text has `code`, **strong**, *emphasis*
 * and [links](/path).
 */

export type MarkdownInline =
  | { type: "text"; text: string }
  | { type: "code"; text: string }
  | { type: "strong"; children: MarkdownInline[] }
  | { type: "em"; children: MarkdownInline[] }
  | { type: "link"; href: string; children: MarkdownInline[] };

export interface MarkdownListItem {
  content: MarkdownInline[];
  /** Anything indented under the item: a nested list, more paragraphs. */
  children: MarkdownBlock[];
}

export type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; content: MarkdownInline[]; text: string }
  | { type: "paragraph"; content: MarkdownInline[] }
  | { type: "list"; ordered: boolean; start: number; items: MarkdownListItem[] }
  | { type: "code"; lang: string; text: string }
  | { type: "quote"; children: MarkdownBlock[] }
  | { type: "rule" }
  /** `header` is left out for a table written without a header row. */
  | { type: "table"; header?: MarkdownInline[][]; rows: MarkdownInline[][][] };

const INLINE_RE = /`([^`]+)`|\*\*(.+?)\*\*|__(.+?)__|\*([^*\s](?:[^*]*[^*\s])?)\*|(?<![\w])_([^_\s](?:[^_]*[^_\s])?)_(?![\w])|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Inline Markdown as runs of text, code, emphasis and links. */
export function parseInline(text: string): MarkdownInline[] {
  const out: MarkdownInline[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    if (m.index > last) out.push({ type: "text", text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ type: "code", text: m[1] });
    else if (m[2] !== undefined || m[3] !== undefined) out.push({ type: "strong", children: parseInline(m[2] ?? m[3]!) });
    else if (m[4] !== undefined || m[5] !== undefined) out.push({ type: "em", children: parseInline(m[4] ?? m[5]!) });
    else out.push({ type: "link", href: m[7]!, children: parseInline(m[6]!) });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out;
}

/** The plain text of inline Markdown, e.g. for a heading's id. */
export function inlineText(content: MarkdownInline[]): string {
  return content.map((p) => (p.type === "text" || p.type === "code" ? p.text : inlineText(p.children))).join("");
}

const HEADING = /^ {0,3}(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/;
const FENCE = /^ {0,3}(```+|~~~+)\s*([\w+-]*)/;
const RULE = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
const QUOTE = /^ {0,3}>\s?/;
const TABLE = /^\s*\|/;
const ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const SEPARATOR = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/;

const blank = (line: string) => !line.trim();
const indentOf = (line: string) => line.match(/^\s*/)![0].replace(/\t/g, "    ").length;
const startsBlock = (line: string) => HEADING.test(line) || FENCE.test(line) || RULE.test(line) || QUOTE.test(line) || TABLE.test(line) || ITEM.test(line);

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "")
    .split(/(?<!\\)\|/)
    .map((c) => parseInline(c.trim().replace(/\\\|/g, "|")));

/** Takes the lines under a list item off by its content's indent. */
const dedent = (lines: string[], by: number) => lines.map((l) => l.replace(new RegExp(`^ {0,${by}}`), ""));

function parseList(lines: string[], from: number): { block: MarkdownBlock; next: number } {
  const first = ITEM.exec(lines[from]!)!;
  const base = indentOf(lines[from]!);
  const ordered = /\d/.test(first[2]!);
  const items: MarkdownListItem[] = [];
  let i = from;
  while (i < lines.length) {
    const m = ITEM.exec(lines[i]!);
    if (!m || indentOf(lines[i]!) !== base || /\d/.test(m[2]!) !== ordered) break;
    const contentIndent = base + m[2]!.length + 1;
    const text = [m[3]!.trim()];
    const under: string[] = [];
    i++;
    // Lazy continuation: plain lines straight after the item carry on its text.
    while (i < lines.length && !blank(lines[i]!) && !startsBlock(lines[i]!.trimStart()) && indentOf(lines[i]!) <= base) text.push(lines[i++]!.trim());
    // Lines indented under the item belong to it; a blank line ends it unless more indented lines follow.
    while (i < lines.length) {
      const line = lines[i]!;
      if (blank(line)) {
        const after = lines.slice(i + 1).find((l) => !blank(l));
        if (after !== undefined && indentOf(after) > base) {
          under.push("");
          i++;
          continue;
        }
        break;
      }
      if (indentOf(line) <= base) break;
      // An indented plain line before anything else under the item carries on its text.
      if (!under.length && !ITEM.test(line) && !startsBlock(line.trimStart())) text.push(line.trim());
      else under.push(line);
      i++;
    }
    items.push({ content: parseInline(text.join(" ")), children: under.length ? parseMarkdown(dedent(under, contentIndent).join("\n")) : [] });
    // A blank line between items of the same list doesn't end it.
    if (i < lines.length && blank(lines[i]!)) {
      const after = lines.slice(i).findIndex((l) => !blank(l));
      const nextLine = after >= 0 ? lines[i + after]! : undefined;
      const nm = nextLine !== undefined ? ITEM.exec(nextLine) : null;
      if (nm && indentOf(nextLine!) === base && /\d/.test(nm[2]!) === ordered) i += after;
    }
  }
  return { block: { type: "list", ordered, start: ordered ? parseInt(first[2]!, 10) : 1, items }, next: i };
}

/** Markdown as blocks. */
export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (blank(line)) {
      i++;
      continue;
    }
    const fence = FENCE.exec(line);
    if (fence) {
      const close = fence[1]!;
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.trim().startsWith(close)) body.push(lines[i++]!);
      i++;
      blocks.push({ type: "code", lang: fence[2] ?? "", text: body.join("\n") });
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      const content = parseInline(heading[2]!);
      blocks.push({ type: "heading", level: heading[1]!.length as 1 | 2 | 3 | 4 | 5 | 6, content, text: inlineText(content) });
      i++;
      continue;
    }
    if (RULE.test(line)) {
      blocks.push({ type: "rule" });
      i++;
      continue;
    }
    if (QUOTE.test(line)) {
      const body: string[] = [];
      while (i < lines.length && !blank(lines[i]!) && (QUOTE.test(lines[i]!) || !startsBlock(lines[i]!))) body.push(lines[i++]!.replace(QUOTE, ""));
      blocks.push({ type: "quote", children: parseMarkdown(body.join("\n")) });
      continue;
    }
    if (TABLE.test(line)) {
      const rows: string[] = [];
      while (i < lines.length && TABLE.test(lines[i]!)) rows.push(lines[i++]!);
      const headed = rows.length > 1 && SEPARATOR.test(rows[1]!.trim());
      const body = headed ? rows.slice(2) : rows.filter((r) => !SEPARATOR.test(r.trim()));
      blocks.push({ type: "table", ...(headed && { header: cells(rows[0]!) }), rows: body.map(cells) });
      continue;
    }
    if (ITEM.test(line)) {
      const { block, next } = parseList(lines, i);
      blocks.push(block);
      i = next;
      continue;
    }
    const text: string[] = [];
    while (i < lines.length && !blank(lines[i]!) && !startsBlock(lines[i]!)) text.push(lines[i++]!.trim());
    blocks.push({ type: "paragraph", content: parseInline(text.join(" ")) });
  }
  return blocks;
}

/** A heading's id from its text, unique among those already taken. */
export function headingId(text: string, taken: Set<string>): string {
  const base = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  taken.add(id);
  return id;
}
