import type { Meta, StoryObj } from "@storybook/react";
import EnvironmentBadge from "./EnvironmentBadge";
import { ENVIRONMENTS } from "../page-data";

const meta: Meta<typeof EnvironmentBadge> = {
  title: "Components/EnvironmentBadge",
  component: EnvironmentBadge,
  argTypes: {
    environment: { control: "select", options: ENVIRONMENTS },
  },
};

export default meta;
type Story = StoryObj<typeof EnvironmentBadge>;

export const Production: Story = {
  args: { environment: "production" },
};

export const Staging: Story = {
  args: { environment: "staging" },
};

export const Mock: Story = {
  args: { environment: "mock" },
};

export const AllEnvironments: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {ENVIRONMENTS.map((env) => (
        <EnvironmentBadge key={env} environment={env} />
      ))}
    </div>
  ),
};
