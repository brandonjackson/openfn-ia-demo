import type { Meta, StoryObj } from "@storybook/react";
import ComponentFormModal from "./ComponentFormModal";
import { FormError } from "../../model/form-error";

const meta: Meta<typeof ComponentFormModal> = {
  title: "Domain/ComponentFormModal",
  component: ComponentFormModal,
  parameters: { layout: "fullscreen" },
  args: { open: true, type: "Document", takenNames: ["planning-officer-guide"], onClose: () => {}, onSubmit: async () => {} },
};

export default meta;
type Story = StoryObj<typeof ComponentFormModal>;

/** Making a document. */
export const Create: Story = {};

/** Making an AI skill, with Build with AI on: AI can draft it from a description instead. */
export const WithAI: Story = { args: { type: "AI Skill", onDraftWithAI: () => {} } };

/** Renaming one and changing its description. */
export const Edit: Story = {
  args: { initial: { name: "planning-officer-guide", description: "How planning officers handle an application." }, takenNames: [] },
};

/** A name the server refused. */
export const Refused: Story = {
  args: { onSubmit: () => Promise.reject(new FormError("The request body is not valid.", { name: ["has already been taken"] })) },
};
