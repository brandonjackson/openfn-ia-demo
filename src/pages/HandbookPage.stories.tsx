import type { Meta, StoryObj } from "@storybook/react";
import HandbookPage from "./HandbookPage";
import { withRouter } from "../stories/decorators";
import { mainNavTree } from "../model/ia-tree";
import { handbookData } from "../fixtures/handbook";

const node = mainNavTree.find((n) => n.id === "handbook")!;
const ancestors: { node: typeof node; path: string }[] = [];

const meta: Meta<typeof HandbookPage> = {
  title: "Pages/HandbookPage",
  component: HandbookPage,
  decorators: [withRouter],
  parameters: { layout: "padded" },
  args: {
    node,
    ancestors,
    currentPath: "/handbook",
    data: handbookData,
    onUploadFiles: async () => {},
    onRemoveFile: async () => {},
  },
};

export default meta;
type Story = StoryObj<typeof HandbookPage>;

export const Default: Story = {};

/** A new handbook with nothing uploaded yet. */
export const NoFiles: Story = {
  args: { data: { ...handbookData, files: [] } },
};
