import type { Meta, StoryObj } from "@storybook/react";
import InstanceSettingsTemplate from "./InstanceSettingsTemplate";
import { withRouter } from "../stories/decorators";
import type { IANode } from "../ia-tree";
import { instanceSettingsData } from "../mock-data/instance";

const root: IANode = { id: "instance-settings", label: "Instance Settings", pageType: "instance-settings" };
const ancestors = [{ node: root, path: "/instance-settings" }];

const section = (id: string, label: string): IANode => ({ id, label, pageType: "instance-settings" });

const meta: Meta<typeof InstanceSettingsTemplate> = {
  title: "Templates/InstanceSettingsTemplate",
  component: InstanceSettingsTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof InstanceSettingsTemplate>;

export const Collaboration: Story = {
  args: {
    node: section("collaboration", "Collaboration"),
    ancestors,
    currentPath: "/instance-settings/collaboration",
    data: instanceSettingsData,
  },
};

export const Billing: Story = {
  args: {
    node: section("billing", "Billing"),
    ancestors,
    currentPath: "/instance-settings/billing",
    data: instanceSettingsData,
  },
};

export const Context: Story = {
  args: {
    node: section("context", "Context"),
    ancestors,
    currentPath: "/instance-settings/context",
    data: instanceSettingsData,
  },
};

export const ContextPendingRequest: Story = {
  name: "Context (request awaiting approval)",
  args: {
    ...Context.args,
    data: {
      ...instanceSettingsData,
      contextLayers: [
        ...instanceSettingsData.contextLayers,
        {
          id: "layer-partner",
          name: "partner.example.org",
          host: "https://partner.example.org/context/health",
          url: "https://partner.example.org/context/health",
          status: "pending",
        },
      ],
    },
  },
};

export const NoContextLayers: Story = {
  name: "Context (empty)",
  args: {
    ...Context.args,
    data: { ...instanceSettingsData, contextLayers: [] },
  },
};
