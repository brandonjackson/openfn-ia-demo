import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Toast, ToastStack } from "./Toast";
import type { ToastItem } from "./Toast";
import Button from "./Button";
import Inline from "./Inline";

const meta: Meta<typeof Toast> = {
  title: "Primitives/Toast",
  component: Toast,
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: { onDismiss: () => {} },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Success: Story = {
  args: { tone: "success", message: "Created intake-v2 from main." },
};

/** A refusal, with the server's reason under it. Errors stay until they're closed. */
export const Refusal: Story = {
  args: { tone: "error", message: "dedup wasn't deleted", detail: "Only the sandbox's owner can delete it." },
};

export const Info: Story = {
  args: { tone: "info", message: "Export started.", detail: "Download it from the project's settings, under History exports, once it's ready." },
};

function StackDemo() {
    const [toasts, setToasts] = useState<ToastItem[]>([
      { id: "1", tone: "error", message: "2 work orders not retried", detail: "This workflow has been deleted." },
      { id: "2", tone: "success", message: "Deleted dedup." },
    ]);
    const add = (tone: ToastItem["tone"]) =>
      setToasts((ts) => [...ts, { id: String(Date.now()), tone, message: tone === "error" ? "That didn't save" : "Saved." }]);
    return (
      <>
        <Inline gap="sm">
          <Button size="sm" variant="secondary" onClick={() => add("success")}>
            Add a success
          </Button>
          <Button size="sm" variant="secondary" onClick={() => add("error")}>
            Add an error
          </Button>
        </Inline>
        <ToastStack toasts={toasts} onDismiss={(id) => setToasts((ts) => ts.filter((t) => t.id !== id))} />
      </>
    );
}

/** The stack the app draws in the corner: press the buttons to add toasts; successes go by themselves. */
export const Stack: StoryObj<typeof ToastStack> = {
  render: () => <StackDemo />,
};
