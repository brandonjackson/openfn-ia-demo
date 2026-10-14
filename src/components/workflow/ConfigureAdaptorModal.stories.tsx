import type { Meta, StoryObj } from "@storybook/react";
import ConfigureAdaptorModal from "./ConfigureAdaptorModal";

const noop = () => {};
const meta: Meta<typeof ConfigureAdaptorModal> = {
  title: "Workflow/ConfigureAdaptorModal",
  component: ConfigureAdaptorModal,
  args: {
    isOpen: true,
    onClose: noop,
    projectId: "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa",
    adaptor: "@openfn/language-dhis2@latest",
    credentialName: "DHIS2 play",
    onChangeAdaptor: noop,
    onVersionChange: noop,
    onCredentialChange: noop,
  },
};
export default meta;
type Story = StoryObj<typeof ConfigureAdaptorModal>;

export const WithCredential: Story = {};
export const NoCredentialNeeded: Story = { args: { adaptor: "@openfn/language-http@latest", credentialName: null } };
