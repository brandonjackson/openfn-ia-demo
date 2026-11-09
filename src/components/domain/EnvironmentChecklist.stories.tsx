import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import EnvironmentChecklist from "./EnvironmentChecklist";
import type { Environment } from "../../model/credentials";

function Stateful(args: ComponentProps<typeof EnvironmentChecklist>) {
  const [value, setValue] = useState<Environment[]>(args.value);
  return <EnvironmentChecklist {...args} value={value} onChange={setValue} />;
}

const meta: Meta<typeof EnvironmentChecklist> = {
  title: "Domain/EnvironmentChecklist",
  component: EnvironmentChecklist,
  parameters: { layout: "padded" },
  args: { value: ["production", "staging", "mock"], idPrefix: "story-env", onChange: () => {} },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof EnvironmentChecklist>;

export const AllEnvironments: Story = {};

export const ProductionOnly: Story = { args: { value: ["production"] } };

export const NonePicked: Story = { args: { value: [], error: "Pick at least one environment" } };
