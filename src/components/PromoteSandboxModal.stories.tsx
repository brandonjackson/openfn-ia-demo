import type { Meta, StoryObj } from "@storybook/react";
import PromoteSandboxModal from "./PromoteSandboxModal";
import { nationalIdWorkflow } from "../mock-data/workflow";
import { projects } from "../mock-data/projects";

const meta: Meta<typeof PromoteSandboxModal> = {
  title: "Components/PromoteSandboxModal",
  component: PromoteSandboxModal,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    onClose: () => {},
    onPromote: () => {},
    sandbox: projects[0].sandboxes[1],
    workflowName: nationalIdWorkflow.name,
    nextVersion: "v3",
  },
};

export default meta;
type Story = StoryObj<typeof PromoteSandboxModal>;

export const Default: Story = {};
