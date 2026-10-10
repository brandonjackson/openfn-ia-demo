import type { Meta, StoryObj } from "@storybook/react";
import HandbookTemplate from "./HandbookTemplate";
import { withRouter } from "../stories/decorators";
import { mainNavTree } from "../ia-tree";
import { handbookData } from "../mock-data/handbook";

const node = mainNavTree.find((n) => n.id === "handbook")!;
const ancestors: { node: typeof node; path: string }[] = [];

const meta: Meta<typeof HandbookTemplate> = {
  title: "Templates/HandbookTemplate",
  component: HandbookTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
  args: { node, ancestors, currentPath: "/handbook", data: handbookData },
};

export default meta;
type Story = StoryObj<typeof HandbookTemplate>;

export const Default: Story = {};

/** A new handbook with nothing uploaded yet. */
export const NoFiles: Story = {
  args: { data: { ...handbookData, files: [] } },
};
