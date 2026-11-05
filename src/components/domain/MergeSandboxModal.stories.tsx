import type { Meta, StoryObj } from "@storybook/react";
import MergeSandboxModal from "./MergeSandboxModal";
import { projects, projectSandboxes } from "../../fixtures/projects";

const sandboxes = projectSandboxes(projects[0]);

const meta: Meta<typeof MergeSandboxModal> = {
  title: "Domain/MergeSandboxModal",
  component: MergeSandboxModal,
  args: { targets: ["main", "decision-sync-fix"], onClose: () => {}, onMerge: async () => {} },
};
export default meta;
type Story = StoryObj<typeof MergeSandboxModal>;

export const Default: Story = { args: { sandbox: sandboxes[1] } };

/** Main has changed one of the workflows since, so merging warns before overwriting it. */
export const Diverged: Story = { args: { sandbox: sandboxes[2], targets: ["main", "intake-validation-v2"] } };
