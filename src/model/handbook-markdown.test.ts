import { describe, expect, it } from "vitest";
import { fromMarkdown } from "./handbook-markdown";

describe("handbook markdown", () => {
  it("reads headings, paragraphs, lists, facts and links", () => {
    const sections = fromMarkdown(
      "## Who we are\n\nWe run [projects](/projects)\nfor the ministry.\n\n- one\n- two\n\n| Owner | M&E |\n\n## Who we are\n\nAgain",
    );
    expect(sections.map((s) => s.id)).toEqual(["who-we-are", "who-we-are-2"]);
    expect(sections[0]!.blocks).toEqual([
      { type: "paragraph", content: ["We run ", { text: "projects", to: "/projects" }, " for the ministry."] },
      { type: "list", items: [["one"], ["two"]] },
      { type: "facts", rows: [{ label: "Owner", value: ["M&E"] }] },
    ]);
  });

  it("keeps text before any heading in an untitled section", () => {
    expect(fromMarkdown("Hello\n\n## Next")[0]).toMatchObject({ title: "", blocks: [{ type: "paragraph", content: ["Hello"] }] });
  });
});
