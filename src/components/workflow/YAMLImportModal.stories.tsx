import type { Meta, StoryObj } from "@storybook/react";
import YAMLImportModal from "./YAMLImportModal";

const meta: Meta<typeof YAMLImportModal> = {
  title: "Workflow/YAMLImportModal",
  component: YAMLImportModal,
  args: { isOpen: true, onClose: () => {}, onCreate: () => {} },
};
export default meta;
type Story = StoryObj<typeof YAMLImportModal>;

export const Upload: Story = {};
