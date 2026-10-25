import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import WorkflowSettingsPanel from "./WorkflowSettingsPanel";
import { defaultWorkflowSettings, nationalIdWorkflow } from "../../mock-data/workflow";

function Stateful(args: ComponentProps<typeof WorkflowSettingsPanel>) {
    const [settings, setSettings] = useState(args.settings);
    return <WorkflowSettingsPanel {...args} settings={settings} onChange={setSettings} />;
}

const meta: Meta<typeof WorkflowSettingsPanel> = {
  title: "Workflow/WorkflowSettingsPanel",
  component: WorkflowSettingsPanel,
  decorators: [
    (Story) => (
      <div className="h-[560px] w-80 border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  args: { workflow: nationalIdWorkflow, settings: defaultWorkflowSettings(nationalIdWorkflow) },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof WorkflowSettingsPanel>;

export const Editable: Story = {};
export const ReadOnly: Story = { args: { readOnly: true } };
