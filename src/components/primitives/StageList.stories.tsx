import type { Meta, StoryObj } from "@storybook/react";
import StageList from "./StageList";
import TextLink from "./TextLink";

const meta: Meta<typeof StageList> = {
  title: "Primitives/StageList",
  component: StageList,
  decorators: [(Story) => <div style={{ maxWidth: 520 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof StageList>;

const link = (label: string) => <TextLink variant="action" onClick={() => undefined}>{label}</TextLink>;

export const Default: Story = {
  args: {
    label: "Stages",
    stages: [
      { id: "plan", label: "Plan", state: "done", action: link("plan.md") },
      { id: "build", label: "Build", state: "done", action: link("Steps") },
      { id: "test", label: "Test", state: "current", description: "Try it with a sample before anyone relies on it.", action: link("Samples") },
      { id: "ship", label: "Ship", state: "upcoming", action: link("Settings") },
      { id: "watch", label: "Watch", state: "upcoming" },
    ],
  },
};

export const JustStarted: Story = {
  args: {
    stages: [
      { id: "plan", label: "Plan", state: "current", description: "Write down what it's for." },
      { id: "build", label: "Build", state: "upcoming" },
      { id: "ship", label: "Ship", state: "upcoming" },
    ],
  },
};

export const AllDone: Story = {
  args: {
    stages: [
      { id: "plan", label: "Plan", state: "done" },
      { id: "build", label: "Build", state: "done" },
      { id: "watch", label: "Watch", state: "current", description: "Nothing left to set up: keep an eye on how it's doing." },
    ],
  },
};
