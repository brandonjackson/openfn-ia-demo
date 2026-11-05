import type { Meta, StoryObj } from "@storybook/react";
import HistoryExportTable from "./HistoryExportTable";
import { projectHistoryExports } from "../../fixtures/project-settings";

const exports = projectHistoryExports("project-a");

const meta: Meta<typeof HistoryExportTable> = {
  title: "Domain/HistoryExportTable",
  component: HistoryExportTable,
  parameters: { layout: "padded" },
  args: { exports, onDownload: () => {} },
};

export default meta;
type Story = StoryObj<typeof HistoryExportTable>;

export const Default: Story = {};

export const Processing: Story = {
  args: {
    exports: [{ id: "exp-new", requestedBy: "Jane Doe", createdAt: "5 Nov 2026, 11:20", status: "processing" }, ...exports],
  },
};

export const Empty: Story = { args: { exports: [] } };
