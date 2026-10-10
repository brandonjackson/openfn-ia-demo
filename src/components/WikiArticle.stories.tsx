import type { Meta, StoryObj } from "@storybook/react";
import WikiArticle from "./WikiArticle";
import { withRouter } from "../stories/decorators";
import { handbookSections } from "../mock-data/handbook";

const meta: Meta<typeof WikiArticle> = {
  title: "Components/WikiArticle",
  component: WikiArticle,
  decorators: [withRouter],
  parameters: { layout: "padded" },
  args: { sections: handbookSections },
};

export default meta;
type Story = StoryObj<typeof WikiArticle>;

export const Default: Story = {};

/** A single section renders without the Contents box. */
export const SingleSection: Story = {
  args: { sections: handbookSections.slice(0, 1) },
};

export const WithoutContents: Story = {
  args: { hideContents: true },
};
