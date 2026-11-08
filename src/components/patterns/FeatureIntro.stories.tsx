import type { Meta, StoryObj } from "@storybook/react";
import FeatureIntro from "./FeatureIntro";
import { KeyRound, Sparkles, Zap } from "lucide-react";

const connectedSystemsIntro = {
  title: "Why connect your systems?",
  features: [
    { icon: KeyRound, title: "Connect once", description: "Org-shared credentials mean everyone on your team gets access, without sharing passwords." },
    { icon: Zap, title: "Instant value", description: "As soon as a system is connected you get observability, channels and credential management." },
    { icon: Sparkles, title: "Smart suggestions", description: "The more systems you connect, the smarter your service recommendations become." },
  ],
};

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
