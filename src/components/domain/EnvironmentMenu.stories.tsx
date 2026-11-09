import type { Meta, StoryObj } from "@storybook/react";
import EnvironmentMenu from "./EnvironmentMenu";
import { projects } from "../../fixtures/projects";

const components = projects[0].components.filter((c) => c.type !== "Workflow");

const meta: Meta<typeof EnvironmentMenu> = {
  title: "Domain/EnvironmentMenu",
  component: EnvironmentMenu,
  decorators: [
    (Story) => (
      <div className="flex h-[28rem] justify-end p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    sandbox: "duplicate-check",
    environment: "staging",
    components,
    onOpenComponent: () => {},
    defaultOpen: true,
  },
};

export default meta;
type Story = StoryObj<typeof EnvironmentMenu>;

/** In a sandbox, on staging. */
export const Default: Story = {};

/** On main: read-only, on production. */
export const OnMain: Story = { args: { sandbox: "main", environment: "production" } };

export const Mock: Story = { args: { environment: "mock" } };

export const NoComponents: Story = { args: { components: [] } };

export const Closed: Story = { args: { defaultOpen: false } };
