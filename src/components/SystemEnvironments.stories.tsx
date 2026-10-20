import type { Meta, StoryObj } from "@storybook/react";
import SystemEnvironments from "./SystemEnvironments";
import { connectedSystems } from "../mock-data/connected-systems";

const bySystem = (id: string) => connectedSystems.find((s) => s.id === id)!.environments;

const meta: Meta<typeof SystemEnvironments> = {
  title: "Components/SystemEnvironments",
  component: SystemEnvironments,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SystemEnvironments>;

export const AllConfigured: Story = {
  args: { environments: bySystem("dhis2") },
};

export const ProductionOnly: Story = {
  args: { environments: bySystem("salesforce") },
};

export const NoneConfigured: Story = {
  args: { environments: bySystem("kobo-toolbox") },
};
