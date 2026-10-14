import type { Meta, StoryObj } from "@storybook/react";
import ExperimentalFeaturesCard from "./ExperimentalFeaturesCard";

const meta: Meta<typeof ExperimentalFeaturesCard> = { title: "Profile/ExperimentalFeaturesCard", component: ExperimentalFeaturesCard };
export default meta;
type Story = StoryObj<typeof ExperimentalFeaturesCard>;

export const Off: Story = { args: { enabled: false } };
export const On: Story = { args: { enabled: true } };
