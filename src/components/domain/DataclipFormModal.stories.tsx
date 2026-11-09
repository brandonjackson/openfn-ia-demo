import type { Meta, StoryObj } from "@storybook/react";
import DataclipFormModal from "./DataclipFormModal";
import { FormError } from "../../model/form-error";

const meta: Meta<typeof DataclipFormModal> = {
  title: "Domain/DataclipFormModal",
  component: DataclipFormModal,
  args: { open: true, onClose: () => {}, onSubmit: async () => {}, defaultName: "Untitled dataclip" },
};

export default meta;
type Story = StoryObj<typeof DataclipFormModal>;

/** A new saved dataclip: its title, what it's for and the JSON to run with. */
export const Default: Story = {};

/** Saving takes a moment: the button says so and ignores a second press. */
export const Saving: Story = { args: { onSubmit: () => new Promise(() => {}) } };

/** A title the project already has, refused by the server, shows under the field. */
export const NameTaken: Story = {
  args: { onSubmit: () => Promise.reject(new FormError("Not saved", { name: ["has already been taken"] })) },
};
