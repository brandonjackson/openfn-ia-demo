import type { Meta, StoryObj } from "@storybook/react";
import HistoryExportsPanel from "./HistoryExportsPanel";
import { projectFiles } from "../../mock-data/project-settings";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof HistoryExportsPanel> = {
  title: "Project settings/HistoryExportsPanel",
  component: HistoryExportsPanel,
  decorators: [withRouter, (Story) => <div className="space-y-4 bg-secondary-100 p-6"><Story /></div>],
  args: { files: projectFiles },
};
export default meta;
type Story = StoryObj<typeof HistoryExportsPanel>;

export const WithExports: Story = {};
export const Empty: Story = { args: { files: [] } };
