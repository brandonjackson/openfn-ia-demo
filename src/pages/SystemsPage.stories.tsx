import type { Meta, StoryObj } from "@storybook/react";
import SystemsPage from "./SystemsPage";
import { withRouter } from "../stories/decorators";
import { connectedSystemListItems, connectedSystemsIntro } from "../fixtures/connected-systems";
import type { IANode } from "../model/ia-tree";
import { systemsPageData } from "../fixtures";

const node: IANode = {
  id: "connected-systems",
  label: "Systems",
  description: "Browse and manage all connected external systems.",
};

const ancestors = [{ node: { id: "root", label: "Home" }, path: "/" }];

const meta: Meta<typeof SystemsPage> = {
  title: "Pages/SystemsPage",
  component: SystemsPage,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SystemsPage>;

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
      intro: { ...connectedSystemsIntro, storageKey: undefined },
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

/** On X-Road: the network map preview, each system's connection method, and the directory of services to add. */
export const WithXRoad: Story = {
  name: "With X-Road",
  args: {
    node,
    ancestors,
    currentPath: "/connected-systems",
    data: { ...systemsPageData, intro: undefined },
  },
};
