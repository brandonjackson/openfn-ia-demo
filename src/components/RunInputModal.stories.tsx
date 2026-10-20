import type { Meta, StoryObj } from "@storybook/react";
import RunInputModal from "./RunInputModal";
import { dataclips } from "../mock-data/runs";

const meta: Meta<typeof RunInputModal> = {
  title: "Components/RunInputModal",
  component: RunInputModal,
  parameters: { layout: "fullscreen" },
  args: { open: true, onClose: () => {}, onRun: () => {}, dataclips },
};

export default meta;
type Story = StoryObj<typeof RunInputModal>;

/** Pick an input already in the project. */
export const Existing: Story = {};

/** Write a new input, and optionally name it. */
export const New: Story = { args: { defaultTab: "New" } };

export const Empty: Story = { args: { defaultTab: "Empty" } };
