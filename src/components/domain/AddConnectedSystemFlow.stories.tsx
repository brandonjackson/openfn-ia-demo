import type { Meta, StoryObj } from "@storybook/react";
import AddConnectedSystemFlow from "./AddConnectedSystemFlow";
import { FormError } from "../../model/form-error";
import { withRouter } from "../../stories/decorators";
import { adaptorCatalog, aiActions, aiModels, builtInTools, catalogCategories } from "../../fixtures/adaptor-catalog";

const catalog = { adaptors: adaptorCatalog, categories: catalogCategories, builtInTools, aiModels, aiActions };

const meta: Meta<typeof AddConnectedSystemFlow> = {
  title: "Domain/AddConnectedSystemFlow",
  component: AddConnectedSystemFlow,
  decorators: [withRouter],
  args: { open: true, onClose: () => {}, catalog },
};

export default meta;
type Story = StoryObj<typeof AddConnectedSystemFlow>;

/** Opens on "Connect a system": the same picker as the editor's "Add a step", with only what a system can be. */
export const ConnectASystem: Story = {};

/** Opened from "Suggested to add", with the system already picked by name. */
export const Preselected: Story = {
  args: { preselectedSystem: "DHIS2" },
};

/** Opened from an adaptor picked in the editor's "Add a step", found by the adaptor's id. */
export const PreselectedByAdaptor: Story = {
  args: { preselectedAdaptor: "openmrs" },
};

/** Adding is refused (the name's taken): the form stays open and says why under the name. */
export const Refused: Story = {
  args: {
    preselectedAdaptor: "dhis2",
    onAdd: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      throw new FormError("The request body is not valid.", { name: ["has already been taken"] });
    },
  },
};
