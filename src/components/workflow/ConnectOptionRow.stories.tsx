import type { Meta, StoryObj } from "@storybook/react";
import { Sparkles } from "lucide-react";
import ConnectOptionRow from "./ConnectOptionRow";
import { aiActions } from "../../mock-data/adaptor-catalog";

const meta: Meta<typeof ConnectOptionRow> = {
  title: "Workflow/ConnectOptionRow",
  component: ConnectOptionRow,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectOptionRow>;

export const Adaptor: Story = {
  args: { adaptor: "dhis2", name: "DHIS2", description: "District Health Information System" },
};

/** An adaptor without a logo falls back to a globe. */
export const NoLogo: Story = {
  args: { adaptor: "mosip", name: "MOSIP", description: "Modular open-source identity platform" },
};

/** An AI action, with an icon in place of a logo. */
export const AiAction: Story = {
  args: { icon: <Sparkles size={16} />, name: aiActions[1].label, description: aiActions[1].description },
};
