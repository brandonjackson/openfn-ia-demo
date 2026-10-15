import type { Meta, StoryObj } from "@storybook/react";
import HistoryExportsTable from "./HistoryExportsTable";
import { projectFiles } from "../../mock-data/project-settings";
import { users } from "../../mock-data/users";

const meta: Meta<typeof HistoryExportsTable> = {
  title: "Project settings/HistoryExportsTable",
  component: HistoryExportsTable,
  args: { files: projectFiles, users },
};
export default meta;
type Story = StoryObj<typeof HistoryExportsTable>;

export const WithExports: Story = {};
export const Empty: Story = { args: { files: [] } };
