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
    onSaveArticle: async () => {},
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

/** Someone outside the organisation reads the handbook but can't edit it or add or remove files. */
export const ReadOnly: Story = {
  args: { onSaveArticle: undefined, onUploadFiles: undefined, onRemoveFile: undefined },
};

const clickEdit = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  [...canvasElement.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Edit")?.click();
};

/** Editing the article as Markdown, with Save and Cancel in the header. */
export const Editing: Story = { play: clickEdit };

/** A save the server refused shows above the editor. */
export const EditRefused: Story = {
  args: { onSaveArticle: () => Promise.reject(new Error("Every section needs a heading")) },
  play: async (ctx) => {
    await clickEdit(ctx);
    await new Promise((r) => setTimeout(r, 0));
    [...ctx.canvasElement.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Save")?.click();
  },
};
