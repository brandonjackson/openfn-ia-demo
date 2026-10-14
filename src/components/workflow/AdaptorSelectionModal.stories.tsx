import type { Meta, StoryObj } from "@storybook/react";
import AdaptorSelectionModal from "./AdaptorSelectionModal";

const meta: Meta<typeof AdaptorSelectionModal> = {
  title: "Workflow/AdaptorSelectionModal",
  component: AdaptorSelectionModal,
  args: { isOpen: true, onClose: () => {}, onSelect: () => {}, adaptorsInUse: ["http", "dhis2"] },
};
export default meta;
type Story = StoryObj<typeof AdaptorSelectionModal>;

export const Default: Story = {};
export const NothingInUse: Story = { args: { adaptorsInUse: [] } };
