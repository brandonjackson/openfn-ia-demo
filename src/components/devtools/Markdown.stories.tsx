import type { Meta, StoryObj } from "@storybook/react";
import Markdown from "./Markdown";

const meta: Meta<typeof Markdown> = {
  title: "Devtools/Markdown",
  component: Markdown,
  args: {
    source:
      "## Heading\n\nSome **bold** text, `code`, and a [link](https://docs.openfn.org).\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n```\nfn(state => state)\n```\n\n<script>alert('shown as text')</script>",
  },
  decorators: [(Story) => <div className="w-[400px] p-5 bg-white">{<Story />}</div>],
};
export default meta;
export const Default: StoryObj<typeof Markdown> = {};
