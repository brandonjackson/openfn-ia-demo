import type { Meta, StoryObj } from "@storybook/react";
import SystemFormModal from "./SystemFormModal";
import { connectedSystems } from "../../fixtures/connected-systems";
import { FormError } from "../../model/form-error";

const dhis2 = connectedSystems.find((s) => s.id === "dhis2")!;

const meta: Meta<typeof SystemFormModal> = {
  title: "Domain/SystemFormModal",
  component: SystemFormModal,
  parameters: { layout: "fullscreen" },
  args: { open: true, system: dhis2, direct: true, onClose: () => {}, onSave: async () => {} },
};

export default meta;
type Story = StoryObj<typeof SystemFormModal>;

/** A system reached directly: its details and where it lives in each environment. */
export const Direct: Story = {};

/** A system on X-Road takes its address from its route, so only its details are edited. */
export const ViaXRoad: Story = {
  args: { direct: false },
};

/** A save the server refused shows under the field it names. */
export const NameTaken: Story = {
  args: { onSave: () => Promise.reject(new FormError("Invalid", { name: ["has already been taken"] })) },
};

/** Opened from one environment's Edit on the system's page: just where the system lives there. */
export const OneEnvironment: Story = {
  args: { environment: "staging" },
};
