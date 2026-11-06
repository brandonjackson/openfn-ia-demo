/**
 * The handbook's article as Markdown and back, so it can be edited as text.
 * Sections are `## ` headings; a paragraph is lines of text; a list is lines
 * starting `- `; facts are a two-column table (`| Label | Value |`), with or
 * without a header row. Links are `[text](/path)`. Anything else in the text
 * is kept as paragraph text.
 */
import type { WikiBlock, WikiInline, WikiSection } from "./handbook";

const inlineToText = (content: WikiInline[]) => content.map((p) => (typeof p === "string" ? p : `[${p.text}](${p.to})`)).join("");

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Text with `[text](/path)` links in it, as inline wiki content. */
export function textToInline(text: string): WikiInline[] {
  const parts: WikiInline[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK_RE)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ text: m[1]!, to: m[2]! });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const cell = (s: string) => s.replace(/\|/g, "\\|");

function blockToMarkdown(block: WikiBlock): string {
  switch (block.type) {
    case "paragraph":
      return inlineToText(block.content);
    case "list":
      return block.items.map((item) => `- ${inlineToText(item)}`).join("\n");
    case "facts":
      return ["| Fact | Detail |", "| --- | --- |", ...block.rows.map((r) => `| ${cell(r.label)} | ${cell(inlineToText(r.value))} |`)].join("\n");
  }
}

/** The article as Markdown. */
export function toMarkdown(sections: WikiSection[]): string {
  return sections.map((s) => [`## ${s.title}`, ...s.blocks.map(blockToMarkdown)].join("\n\n")).join("\n\n") + "\n";
}

/** A section's id from its title, unique among those already taken. */
function sectionId(title: string, taken: Set<string>): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  taken.add(id);
  return id;
}

const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, "|"));

const isSeparator = (line: string) => /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/.test(line.trim());

/** Turns one run of non-blank lines into blocks. */
function linesToBlocks(lines: string[]): WikiBlock[] {
  const blocks: WikiBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (/^\s*\|/.test(line)) {
      const rows: string[] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i]!)) rows.push(lines[i++]!);
      // A header row is the one above a separator; it isn't a fact.
      const body = rows.length > 1 && isSeparator(rows[1]!) ? rows.slice(2) : rows.filter((r) => !isSeparator(r));
      const facts = body.map(splitRow).map(([label = "", ...rest]) => ({ label, value: textToInline(rest.join(" | ")) }));
      if (facts.length) blocks.push({ type: "facts", rows: facts });
    } else if (/^\s*[-*] /.test(line)) {
      const items: WikiInline[][] = [];
      while (i < lines.length && /^\s*[-*] /.test(lines[i]!)) items.push(textToInline(lines[i++]!.replace(/^\s*[-*] /, "").trim()));
      blocks.push({ type: "list", items });
    } else {
      const text: string[] = [];
      while (i < lines.length && !/^\s*(\||[-*] )/.test(lines[i]!)) text.push(lines[i++]!.trim());
      blocks.push({ type: "paragraph", content: textToInline(text.join(" ")) });
    }
  }
  return blocks;
}

/**
 * Markdown as the article. Text before the first heading goes in an
 * untitled section; `title` is blank there, and the server refuses it.
 */
export function fromMarkdown(markdown: string): WikiSection[] {
  const sections: { title: string; lines: string[] }[] = [];
  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const heading = /^#{1,2}\s+(.*)$/.exec(line);
    if (heading) sections.push({ title: heading[1]!.trim(), lines: [] });
    else {
      if (!sections.length) {
        if (!line.trim()) continue;
        sections.push({ title: "", lines: [] });
      }
      sections.at(-1)!.lines.push(line);
    }
  }
  const taken = new Set<string>();
  return sections.map(({ title, lines }) => {
    // Blank lines separate blocks.
    const runs: string[][] = [[]];
    for (const l of lines) {
      if (l.trim()) runs.at(-1)!.push(l);
      else if (runs.at(-1)!.length) runs.push([]);
    }
    return { id: sectionId(title, taken), title, blocks: runs.filter((r) => r.length).flatMap(linesToBlocks) };
  });
}
