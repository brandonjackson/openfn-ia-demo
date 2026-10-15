import type { Meta, StoryObj } from "@storybook/react";
import HistoryExportsPanel from "./HistoryExportsPanel";
import { projectFiles } from "../../mock-data/project-settings";
import { users } from "../../mock-data/users";
import { withRouter, withGrayPanel } from "../../stories/decorators";

const meta: Meta<typeof HistoryExportsPanel> = {
  title: "Project settings/HistoryExportsPanel",
  component: HistoryExportsPanel,
  decorators: [withRouter, withGrayPanel],
  args: { files: projectFiles, users },
};
export default meta;
type Story = StoryObj<typeof HistoryExportsPanel>;

export const WithExports: Story = {};
export const Empty: Story = { args: { files: [] } };
