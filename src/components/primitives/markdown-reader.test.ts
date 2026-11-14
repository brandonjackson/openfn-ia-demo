import { describe, expect, it } from "vitest";
import { headingId, parseInline, parseMarkdown } from "./markdown-reader";

describe("markdown", () => {
  it("reads inline code, strong, emphasis and links", () => {
    expect(parseInline("Use `fn` **now** or *later*, see [docs](/docs).")).toEqual([
      { type: "text", text: "Use " },
      { type: "code", text: "fn" },
      { type: "text", text: " " },
      { type: "strong", children: [{ type: "text", text: "now" }] },
      { type: "text", text: " or " },
      { type: "em", children: [{ type: "text", text: "later" }] },
      { type: "text", text: ", see " },
      { type: "link", href: "/docs", children: [{ type: "text", text: "docs" }] },
      { type: "text", text: "." },
    ]);
  });

  it("leaves underscores inside words alone", () => {
    expect(parseInline("state.queued_for_retry")).toEqual([{ type: "text", text: "state.queued_for_retry" }]);
  });

  it("reads headings, paragraphs joined across lines, rules and quotes", () => {
    const blocks = parseMarkdown("# Title\n\nOne\ntwo\n\n---\n\n> quoted\n> more");
    expect(blocks.map((b) => b.type)).toEqual(["heading", "paragraph", "rule", "quote"]);
    expect(blocks[1]).toEqual({ type: "paragraph", content: [{ type: "text", text: "One two" }] });
    expect(blocks[3]).toMatchObject({ type: "quote", children: [{ type: "paragraph", content: [{ type: "text", text: "quoted more" }] }] });
  });

  it("reads lists, with indented lines carrying on an item and indented items nesting", () => {
    const [list] = parseMarkdown("- one\n  carried on\n- two\n  - two a\n- three\n\n1. first\n2. second");
    expect(list).toMatchObject({ type: "list", ordered: false });
    if (list?.type !== "list") throw new Error("not a list");
    expect(list.items.map((i) => i.content)).toEqual([[{ type: "text", text: "one carried on" }], [{ type: "text", text: "two" }], [{ type: "text", text: "three" }]]);
    expect(list.items[1]!.children).toMatchObject([{ type: "list", items: [{ content: [{ type: "text", text: "two a" }] }] }]);
    expect(parseMarkdown("1. first\n2. second")[0]).toMatchObject({ type: "list", ordered: true, start: 1 });
  });

  it("reads fenced code as it's written", () => {
    expect(parseMarkdown("```json\n{ \"a\": 1 }\n\n# not a heading\n```")).toEqual([{ type: "code", lang: "json", text: '{ "a": 1 }\n\n# not a heading' }]);
  });

  it("reads tables with a header row, and without one as facts", () => {
    expect(parseMarkdown("| A | B |\n| --- | --- |\n| 1 | 2 |")[0]).toMatchObject({ type: "table", header: [[{ text: "A" }], [{ text: "B" }]], rows: [[[{ text: "1" }], [{ text: "2" }]]] });
    const facts = parseMarkdown("| Owner | M\\|E |")[0];
    expect(facts).toMatchObject({ type: "table", rows: [[[{ text: "Owner" }], [{ text: "M|E" }]]] });
    expect(facts && "header" in facts).toBe(false);
  });

  it("reads a spec with headings, a code block and a table", () => {
    const source = "# Spec\n\n## Trigger\nWebhook.\n\n## Input\n```json\n{ \"a\": 1 }\n```\n\n## Steps\n| Step | Adaptor |\n| --- | --- |\n| Verify | http |\n| Notify | twilio |\n";
    const spec = parseMarkdown(source);
    expect(spec.filter((b) => b.type === "heading").map((b) => (b.type === "heading" ? b.text : ""))).toEqual(["Spec", "Trigger", "Input", "Steps"]);
    expect(spec[2]).toEqual({ type: "paragraph", content: [{ type: "text", text: "Webhook." }] });
    expect(spec.some((b) => b.type === "code")).toBe(true);
    expect(spec.find((b) => b.type === "table")).toMatchObject({ rows: { length: 2 } });
  });

  it("makes unique ids for headings", () => {
    const taken = new Set<string>();
    expect([headingId("Who we are", taken), headingId("Who we are", taken), headingId("!!", taken)]).toEqual(["who-we-are", "who-we-are-2", "section"]);
  });
});
