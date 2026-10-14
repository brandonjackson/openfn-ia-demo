import type { Meta, StoryObj } from "@storybook/react";
import DeleteSandboxModal from "./DeleteSandboxModal";

const meta: Meta<typeof DeleteSandboxModal> = {
  title: "Projects/Sandboxes/DeleteSandboxModal",
  component: DeleteSandboxModal,
  args: { sandboxName: "fhir-mapping-v2", rootName: "openhie-project", onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof DeleteSandboxModal>;

export const Default: Story = {};
export const WithChildren: Story = { args: { descendantCount: 2 } };
export const CurrentProject: Story = { args: { isCurrent: true } };
