import type { Meta, StoryObj } from "@storybook/react";
import ChannelFormModal from "./ChannelFormModal";
import { projectCredentials } from "../../fixtures/adaptor-reference";

const meta: Meta<typeof ChannelFormModal> = {
  title: "Domain/ChannelFormModal",
  component: ChannelFormModal,
  args: {
    open: true,
    takenNames: ["eplanning-submission-received"],
    credentials: projectCredentials.map((c) => c.name),
    eventAddress: (name) => `https://app.openfn.org/c/project-a/${name}`,
    onClose: () => {},
    onSubmit: async () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ChannelFormModal>;

export const New: Story = {};

export const Edit: Story = {
  args: {
    initial: {
      name: "case-management-create-case",
      description: "Creates a case in the local authority's case management system.",
      channelType: "write",
      system: "Case Management",
      destinationUrl: "https://cms.accra.gov.example/api/v2/cases",
      credential: projectCredentials[0].name,
      enabled: true,
    },
  },
};
