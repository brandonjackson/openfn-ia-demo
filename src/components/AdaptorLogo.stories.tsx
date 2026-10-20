import type { Meta, StoryObj } from "@storybook/react";
import AdaptorLogo from "./AdaptorLogo";
import { connectedSystems } from "../mock-data/connected-systems";

const meta: Meta<typeof AdaptorLogo> = {
  title: "Components/AdaptorLogo",
  component: AdaptorLogo,
  argTypes: { size: { control: "select", options: ["xs", "sm", "md", "lg"] } },
};

export default meta;
type Story = StoryObj<typeof AdaptorLogo>;

export const Default: Story = {
  args: { adaptor: "dhis2", name: "DHIS2", size: "md" },
};

/** Systems without a logo fall back to a globe. */
export const Fallback: Story = {
  args: { adaptor: "not-an-adaptor", size: "md" },
};

export const ConnectedSystems: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {connectedSystems.map((s) => (
        <AdaptorLogo key={s.id} adaptor={s.adaptor} name={s.name} size="lg" />
      ))}
    </div>
  ),
};
