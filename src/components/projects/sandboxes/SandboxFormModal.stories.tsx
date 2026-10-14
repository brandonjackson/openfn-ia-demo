import type { Meta, StoryObj } from "@storybook/react";
import SandboxFormModal from "./SandboxFormModal";

const meta: Meta<typeof SandboxFormModal> = {
  title: "Projects/Sandboxes/SandboxFormModal",
  component: SandboxFormModal,
  args: { mode: "new", parentName: "openhie-project", initialColor: "#5AA1F0", onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof SandboxFormModal>;

export const New: Story = {};
export const Edit: Story = { args: { mode: "edit", initialName: "fhir-mapping-v2", initialColor: "#F39B33" } };
export const DuplicateName: Story = { args: { initialName: "fhir-mapping-v2", existingNames: ["fhir-mapping-v2"] } };
