import type { Meta, StoryObj } from "@storybook/react";
import TemplateBrowserModal from "./TemplateBrowserModal";
import { workflowTemplates } from "../../mock-data/workflow";

const meta: Meta<typeof TemplateBrowserModal> = {
  title: "Workflow/TemplateBrowserModal",
  component: TemplateBrowserModal,
  args: {
    isOpen: true,
    onClose: () => {},
    projectId: "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa",
    templates: workflowTemplates,
    onCreate: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TemplateBrowserModal>;

export const Default: Story = {};
