import type { Meta, StoryObj } from "@storybook/react";
import PromoteSandboxModal from "./PromoteSandboxModal";
import { projects } from "../../fixtures/projects";

const meta: Meta<typeof PromoteSandboxModal> = {
  title: "Domain/PromoteSandboxModal",
  component: PromoteSandboxModal,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    onClose: () => {},
    onPromote: async () => {},
    sandbox: projects[0].sandboxes[1],
    target: "main",
    changes: [
      { kind: "added", summary: "Added step Check for a duplicate application" },
      { kind: "changed", summary: "Changed code in Search for duplicate citizens in Identity" },
      { kind: "added", summary: "Added collection applicants" },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof PromoteSandboxModal>;

/** From the editor, which names the version the workflow becomes. */
export const Default: Story = { args: { nextVersion: "v3" } };

/** From the Sandboxes page: the whole sandbox's changes, every workflow in it. */
export const WholeSandbox: Story = {
  args: {
    changes: [
      { kind: "changed", summary: "Changed the workflow Intake validation" },
      { kind: "added", summary: "Added the workflow Duplicate check" },
    ],
  },
};

/** Nothing changed yet. */
export const NothingToPromote: Story = { args: { changes: [] } };

/** Into a parent other than main. */
export const IntoAnotherSandbox: Story = { args: { target: "intake-validation-v2" } };

/** The server refused it: the reason shows under the message, and the request stays open. */
export const Refused: Story = { args: { onPromote: () => Promise.reject(new Error("Main has changed since; try again.")) } };
