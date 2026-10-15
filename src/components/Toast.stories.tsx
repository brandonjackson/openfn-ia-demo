import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";
import { Toast, ToastProvider, useToast } from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "Shared/Toast",
  component: Toast,
  args: { tone: "info", children: "Token created successfully", onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof Toast>;

export const Info: Story = {};
export const Error: Story = { args: { tone: "error", children: "Workflow could not be saved" } };

function Trigger() {
  const toast = useToast();
  return (
    <div className="flex gap-2">
      <Button onClick={() => toast("Project updated successfully")}>Show info</Button>
      <Button theme="secondary" onClick={() => toast("Something went wrong", "error")}>
        Show error
      </Button>
    </div>
  );
}

/** Click a button: the provider shows the toast bottom-centre and clears it after a few seconds. */
export const WithProvider: Story = {
  render: () => (
    <ToastProvider>
      <Trigger />
    </ToastProvider>
  ),
};
