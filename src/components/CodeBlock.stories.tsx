import type { Meta, StoryObj } from "@storybook/react";
import CodeBlock from "./CodeBlock";
import { projects } from "../mock-data/projects";

const api = projects[0].services[0].api!;

const meta: Meta<typeof CodeBlock> = {
  title: "Components/CodeBlock",
  component: CodeBlock,
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const Request: Story = {
  args: { label: "Example request", code: api.requestExample! },
};

export const Json: Story = {
  args: { label: "Example response", code: api.outputExample },
};

export const NoLabel: Story = {
  args: { code: api.outputExample },
};
