import type { Meta, StoryObj } from "@storybook/react";
import AddConnectedSystemFlow from "./AddConnectedSystemFlow";
import { withRouter } from "../../stories/decorators";
import { adaptors } from "../../fixtures/adaptors";

const meta: Meta<typeof AddConnectedSystemFlow> = {
  title: "Patterns/AddConnectedSystemFlow",
  component: AddConnectedSystemFlow,
  decorators: [withRouter],
  args: { open: true, onClose: () => {}, adaptors },
};

export default meta;
type Story = StoryObj<typeof AddConnectedSystemFlow>;

/** Opens on a searchable list of every adaptor. */
export const PickAnAdaptor: Story = {};

/** Opened from "Suggested to add", with the system already picked. */
export const Preselected: Story = {
  args: { preselectedSystem: adaptors[0].name },
};
