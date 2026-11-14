import type { Meta, StoryObj } from "@storybook/react";
import Markdown from "./Markdown";
import { workflowDocs } from "../../fixtures/workflow-files";
import { handbookSections } from "../../fixtures/handbook";
import { toMarkdown } from "../../model/handbook-markdown";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof Markdown> = {
  title: "Primitives/Markdown",
  component: Markdown,
  decorators: [withRouter],
  args: { source: workflowDocs.spec },
};

export default meta;
type Story = StoryObj<typeof Markdown>;

/** A spec: headings, a code block and a table with a header row. */
export const Default: Story = {};

/** Nested lists and a wide table. */
export const Context: Story = { args: { source: workflowDocs.context } };

/** The handbook: `##` sections with a Contents box, and tables without a header row read as facts. */
export const WithContents: Story = { args: { source: toMarkdown(handbookSections), contents: true } };

/** Everything it reads, inline and block. */
export const Everything: Story = {
  args: {
    source: `# Heading one

A paragraph with \`code\`, **strong**, *emphasis*, a [link in the app](/projects) and [one that isn't](https://docs.openfn.org).

## Lists

- One
- Two
  - Two and a half
- Three

1. First
2. Second

## Quote and rule

> Quoted text, perhaps from the legislation.

---

### Facts

| Owner | Ministry of Health |
| Agreement | Data sharing agreement, 2025 |
`,
  },
};
