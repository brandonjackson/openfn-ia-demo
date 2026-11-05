import type { Meta, StoryObj } from "@storybook/react";
import { Check, FlaskConical, Globe, Trash2 } from "lucide-react";
import ListRow from "./ListRow";
import Badge from "./Badge";
import Button from "./Button";
import { withRouter } from "../../stories/decorators";
import { connectedSystemListItems } from "../../fixtures/connected-systems";
import { projects, projectSandboxes } from "../../fixtures/projects";

const system = connectedSystemListItems[0];
const sandbox = projectSandboxes(projects[2])[1];

const meta: Meta<typeof ListRow> = {
  title: "Primitives/ListRow",
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
    badges: <Badge label="Selected" tone="indigo" icon={Check} />,
  },
};

export const WithActions: Story = {
  args: {
    ...Clickable.args,
    actions: (
      <Button variant="outline-danger" size="xs" icon={Trash2}>
        Delete
      </Button>
    ),
  },
};

/** Labelled values lined up at the right of the row, hidden on narrow screens. */
export const WithColumns: Story = {
  args: {
    ...Clickable.args,
    meta: undefined,
    columns: [
      { label: "Runs", value: "1,204", width: "sm" },
      { label: "Failed", value: "12", width: "sm" },
      { label: "Last updated", value: "Oct 2, 2:30 PM", width: "lg" },
    ],
  },
};

/** Something you could add rather than one that exists, e.g. a suggested system. */
export const Dashed: Story = {
  args: {
    ...Clickable.args,
    badges: undefined,
    meta: undefined,
    dashed: true,
  },
};
