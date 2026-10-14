import type { Meta, StoryObj } from "@storybook/react";
import TemplateBrowserModal from "./TemplateBrowserModal";

const meta: Meta<typeof TemplateBrowserModal> = {
  title: "Workflow/TemplateBrowserModal",
  component: TemplateBrowserModal,
  args: { isOpen: true, onClose: () => {}, projectId: "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa", onCreate: () => {} },
};
export default meta;
type Story = StoryObj<typeof TemplateBrowserModal>;

export const Default: Story = {};
