import type { Meta, StoryObj } from "@storybook/react";
import OtherProjectRow from "./OtherProjectRow";
import { withRouter } from "../../stories/decorators";
import { otherProjects } from "../../fixtures/admin";

const [registry] = otherProjects;
const project = { id: registry!.id, name: registry!.id, description: registry!.description, ownerName: "Priya Nair", memberCount: registry!.members.length, joinRequested: false };

const meta: Meta<typeof OtherProjectRow> = {
  title: "Domain/OtherProjectRow",
  component: OtherProjectRow,
  args: { project, onRequestToJoin: () => Promise.resolve() },
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
type Story = StoryObj<typeof OtherProjectRow>;

/** A project you aren't in: it doesn't open, and asks to join. */
export const Default: Story = {};

/** Asking takes a moment: the button says so and ignores a second press. */
export const Requesting: Story = {
  args: { onRequestToJoin: () => new Promise(() => {}) },
};

/** Once you've asked, it says Requested. */
export const Requested: Story = {
  args: { project: { ...project, joinRequested: true } },
};
