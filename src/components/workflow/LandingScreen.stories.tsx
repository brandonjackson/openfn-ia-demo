import type { Meta, StoryObj } from "@storybook/react";
import LandingScreen from "./LandingScreen";

const noop = () => {};
const meta: Meta<typeof LandingScreen> = {
  title: "Workflow/LandingScreen",
  component: LandingScreen,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="relative h-[700px]"><Story /></div>],
  args: { onBuildWithAI: noop, onBuildFromScratch: noop, onBrowseTemplates: noop, onImportYAML: noop },
};
export default meta;
type Story = StoryObj<typeof LandingScreen>;

export const WithAI: Story = {};
export const WithoutAI: Story = { args: { aiAssistantEnabled: false } };
