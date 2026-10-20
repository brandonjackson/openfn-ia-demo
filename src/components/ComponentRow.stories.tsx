import type { Meta, StoryObj } from "@storybook/react";
import ComponentRow from "./ComponentRow";
import { withRouter } from "../stories/decorators";
import { projects } from "../mock-data/projects";

const project = projects[0];
const byType = (type: string) => project.components.find((c) => c.type === type)!;

const meta: Meta<typeof ComponentRow> = {
  title: "Components/ComponentRow",
  component: ComponentRow,
  decorators: [
    withRouter,
    (Story) => (
      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  args: { projectPath: `/projects/${project.id}` },
};

export default meta;
type Story = StoryObj<typeof ComponentRow>;

/** A workflow, which opens in the workflow editor. */
export const Workflow: Story = { args: { component: byType("Workflow") } };

export const Channel: Story = { args: { component: byType("Channel") } };

/** As used on the Components page: description shown, type implied by the group. */
export const WithDescription: Story = {
  args: { component: byType("Artifact"), showDescription: true, hideType: true },
};
