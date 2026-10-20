import type { Meta, StoryObj } from "@storybook/react";
import SystemPill from "./SystemPill";
import { withRouter } from "../stories/decorators";
import { connectedSystemSummaries, recommendedSystems } from "../mock-data/connected-systems";

const meta: Meta<typeof SystemPill> = {
  title: "Components/SystemPill",
  component: SystemPill,
  decorators: [withRouter],
};

export default meta;
type Story = StoryObj<typeof SystemPill>;

export const Connected: Story = {
  args: { name: "DHIS2", adaptor: "dhis2", to: "/connected-systems/dhis2" },
};

export const Suggested: Story = {
  args: { name: "OpenMRS", adaptor: "openmrs", suggested: true, title: "Electronic medical records" },
};

export const Row: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {connectedSystemSummaries.map((s) => (
        <SystemPill key={s.id} name={s.name} adaptor={s.adaptor} to={`/connected-systems/${s.id}`} />
      ))}
      {recommendedSystems.map((s) => (
        <SystemPill key={s.name} name={s.name} adaptor={s.adaptor} suggested title={s.description} />
      ))}
    </div>
  ),
};
