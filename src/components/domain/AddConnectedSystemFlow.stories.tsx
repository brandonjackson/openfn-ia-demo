import type { Meta, StoryObj } from "@storybook/react";
import AddConnectedSystemFlow from "./AddConnectedSystemFlow";
import { FormError } from "../../model/form-error";
import { withRouter } from "../../stories/decorators";
import { adaptors } from "../../fixtures/adaptors";

const meta: Meta<typeof AddConnectedSystemFlow> = {
  title: "Domain/AddConnectedSystemFlow",
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

/** Opened from an adaptor picked in the editor's "Add a step", found by the adaptor's id. */
export const PreselectedByAdaptor: Story = {
  args: { preselectedAdaptor: adaptors[1].id },
};

/** Adding is refused (the name's taken): the form stays open and says why. Pick a system, then add it. */
export const Refused: Story = {
  args: {
    open: true,
    onAdd: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      throw new FormError("The request body is not valid.", { name: ["has already been taken"] });
    },
  },
};
