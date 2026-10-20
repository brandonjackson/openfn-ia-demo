import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import CreateProjectFlow from "./CreateProjectFlow";

const meta: Meta<typeof CreateProjectFlow> = {
  title: "Components/CreateProjectFlow",
  component: CreateProjectFlow,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    open: true,
    onClose: () => {},
    onCreate: (project) => console.log("create project", project),
  },
};

export default meta;
type Story = StoryObj<typeof CreateProjectFlow>;

export const Default: Story = {
  name: "Open form",
};

export const Closed: Story = {
  name: "Closed (renders nothing)",
  args: {
    open: false,
  },
};

function InteractiveDemo() {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<string | null>(null);

  return (
    <div className="p-8 space-y-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        New project
      </button>
      {created && (
        <p className="text-sm text-gray-600">
          Created <span className="font-medium">{created}</span> — would
          navigate to the project.
        </p>
      )}
      <CreateProjectFlow
        open={open}
        onClose={() => setOpen(false)}
        onCreate={(project) => {
          setCreated(project.name);
          setOpen(false);
        }}
      />
    </div>
  );
}

export const Interactive: Story = {
  name: "Triggered from a button",
  render: () => <InteractiveDemo />,
};
