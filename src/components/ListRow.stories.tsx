import type { Meta, StoryObj } from "@storybook/react";
import { Check, FlaskConical, Globe } from "lucide-react";
import ListRow from "./ListRow";
import Badge from "./Badge";
import { withRouter } from "../stories/decorators";
import { connectedSystemListItems } from "../mock-data/connected-systems";
import { projects, projectSandboxes } from "../mock-data/projects";

const system = connectedSystemListItems[0];
const sandbox = projectSandboxes(projects[2])[1];

const meta: Meta<typeof ListRow> = {
  title: "Components/ListRow",
  component: ListRow,
  decorators: [
    withRouter,
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ListRow>;

export const Link: Story = {
  args: {
    to: `/connected-systems/${system.id}`,
    icon: Globe,
    title: system.name,
    description: system.description,
    badges: <Badge label="You have access" tone="green" icon={Check} />,
  },
};

export const Clickable: Story = {
  args: {
    onClick: () => {},
    icon: FlaskConical,
    title: sandbox.name,
    monoTitle: true,
    description: sandbox.description,
    meta: (
      <>
        <span>Created by {sandbox.createdBy}</span>
        <span>Active {sandbox.lastActivity}</span>
      </>
    ),
  },
};

export const Selected: Story = {
  args: {
    ...Clickable.args,
    onClick: undefined,
    selected: true,
    badges: <Badge label="Selected" tone="blue" icon={Check} />,
  },
};
