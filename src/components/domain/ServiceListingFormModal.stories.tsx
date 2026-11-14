import type { Meta, StoryObj } from "@storybook/react";
import ServiceListingFormModal from "./ServiceListingFormModal";

const meta: Meta<typeof ServiceListingFormModal> = {
  title: "Domain/ServiceListingFormModal",
  component: ServiceListingFormModal,
  args: { open: true, onClose: () => {}, onSubmit: () => Promise.resolve() },
};

export default meta;
type Story = StoryObj<typeof ServiceListingFormModal>;

/** Publishing a workflow: the name starts as the workflow's. */
export const Publish: Story = {
  args: { workflowName: "apply-national-id" },
};

/** Editing a published service's listing. */
export const EditListing: Story = {
  args: { initial: { name: "Submit a planning application", description: "Receives planning applications from the e-planning portal." } },
};

/** Saving takes a moment: the button says so and ignores a second press. */
export const Saving: Story = {
  args: { initial: { name: "Submit a planning application", description: "" }, onSubmit: () => new Promise(() => {}) },
};
