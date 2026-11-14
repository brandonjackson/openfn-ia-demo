import type { Meta, StoryObj } from "@storybook/react";
import SystemEnvironments from "./SystemEnvironments";
import { connectedSystems } from "../../fixtures/connected-systems";

const bySystem = (id: string) => connectedSystems.find((s) => s.id === id)!.environments;

const meta: Meta<typeof SystemEnvironments> = {
  title: "Domain/SystemEnvironments",
  component: SystemEnvironments,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SystemEnvironments>;

/** Reading only: where the system lives in each environment, and which credential reaches it. */
export const AllConfigured: Story = {
  args: { environments: bySystem("dhis2") },
};

export const ProductionOnly: Story = {
  args: { environments: bySystem("salesforce") },
};

export const NoneConfigured: Story = {
  args: { environments: bySystem("kobo-toolbox") },
};

/** For someone who can change the system: each environment has an Edit, which opens the system's form on it. */
export const Editable: Story = {
  args: { environments: bySystem("dhis2"), onEdit: () => {} },
};
