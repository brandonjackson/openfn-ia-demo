import type { Meta, StoryObj } from "@storybook/react";
import ListTemplate from "./ListTemplate";
import { withRouter } from "../stories/decorators";
import { connectedSystemListItems } from "../mock-data/connected-systems";
import type { IANode } from "../ia-tree";

const node: IANode = {
  id: "connected-systems",
  label: "Systems",
  description: "Browse and manage all connected external systems.",
};

const ancestors = [{ node: { id: "root", label: "Home" }, path: "/" }];

const meta: Meta<typeof ListTemplate> = {
  title: "Templates/ListTemplate",
  component: ListTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ListTemplate>;

export const Default: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/connected-systems",
    data: {
      pageType: "list",
      filters: [{ label: "Access", options: ["All", "You have access", "No access"] }],
      items: connectedSystemListItems,
      filterKey: "access",
      filterMap: { "You have access": "yes", "No access": "no" },
      showSuggestions: true,
    },
  },
};

export const EmptyList: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/connected-systems",
    data: {
      pageType: "list",
      filters: [{ label: "Access", options: ["All", "You have access", "No access"] }],
      items: [],
      showSuggestions: false,
    },
  },
};

export const NoFilters: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/connected-systems",
    data: {
      pageType: "list",
      filters: [],
      items: connectedSystemListItems.slice(0, 3),
      showSuggestions: false,
    },
  },
};
