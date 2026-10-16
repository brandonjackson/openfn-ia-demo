import type { Meta, StoryObj } from "@storybook/react";
import Alert from "./Alert";
import FormModal from "./FormModal";
import { TextArea, TextInput } from "./Inputs";

const meta: Meta<typeof FormModal> = {
  title: "Shared/FormModal",
  component: FormModal,
  args: {
    open: true,
    onClose: () => {},
    onSubmit: () => {},
    title: "Create a new project",
    size: "md",
    formId: "project-form",
    submitLabel: "Create project",
    cancelId: "cancel-project-creation",
    children: (
      <>
        <TextInput id="project_raw_name" label="Name" required />
        <TextArea id="project_description" label="Description" />
      </>
    ),
  },
};
export default meta;
type Story = StoryObj<typeof FormModal>;

export const Default: Story = {};
export const SubmitDisabled: Story = { args: { submitDisabled: true, submitTooltip: "Enter a name first" } };
export const Danger: Story = {
  args: {
    title: "Delete user",
    size: "sm",
    submitLabel: "Delete account",
    submitTheme: "danger",
    formClassName: "space-y-3 text-sm text-gray-600",
    children: <TextInput id="scheduled_deletion_email" label="User email" />,
  },
};
export const ContentBeforeForm: Story = {
  args: {
    before: <Alert type="info">Fields marked * are required.</Alert>,
  },
};
/** An async `onSubmit`: the submit button spins and Cancel is inert until it settles. */
export const Pending: Story = {
  args: { onSubmit: () => new Promise(() => {}) },
  play: async ({ canvasElement }) => {
    canvasElement.ownerDocument.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
  },
};
/** A rejected `onSubmit`: the modal stays open and shows the message above the form. */
export const Failed: Story = {
  args: { onSubmit: () => Promise.reject(new Error("A project with that name already exists.")) },
  play: async ({ canvasElement }) => {
    canvasElement.ownerDocument.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
  },
};
