import type { Meta, StoryObj } from "@storybook/react";
import FeatureIntro from "./FeatureIntro";
import { connectedSystemsIntro } from "../../fixtures/connected-systems";

const meta: Meta<typeof FeatureIntro> = {
  title: "Patterns/FeatureIntro",
  component: FeatureIntro,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof FeatureIntro>;

export const Default: Story = {
  args: connectedSystemsIntro,
};

export const WithDescription: Story = {
  args: {
    ...connectedSystemsIntro,
    description: "Systems are the external tools your workflows read from and write to.",
  },
};

export const TwoFeatures: Story = {
  args: {
    ...connectedSystemsIntro,
    features: connectedSystemsIntro.features.slice(0, 2),
  },
};
