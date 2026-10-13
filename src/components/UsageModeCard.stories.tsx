import type { Meta, StoryObj } from "@storybook/react";
import { Bot, Workflow } from "lucide-react";
import UsageModeCard from "./UsageModeCard";
import CodeBlock from "./CodeBlock";
import { mcpServerUrl } from "../mock-data/service-catalog";

const meta: Meta<typeof UsageModeCard> = {
  title: "Components/UsageModeCard",
  component: UsageModeCard,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UsageModeCard>;

export const FromWorkflow: Story = {
  args: {
    icon: Workflow,
    title: "Call it from your workflows",
    description: "Any workflow in your organization can call a live service as a step.",
  },
};

export const AgentTool: Story = {
  args: {
    icon: Bot,
    title: "Give it to your agents",
    description: "Live services are also tools on your organization's MCP server.",
    badge: "Preview",
    children: <CodeBlock label="MCP server" code={mcpServerUrl} />,
  },
};
