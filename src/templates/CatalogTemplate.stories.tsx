import type { Meta, StoryObj } from "@storybook/react";
import CatalogTemplate from "./CatalogTemplate";
import { withRouter } from "../stories/decorators";
import { serviceCatalogData } from "../mock-data/service-catalog";
import type { IANode } from "../ia-tree";

const node: IANode = {
  id: "service-catalog",
  label: "Services",
  description: "Browse the catalog of published services.",
};

const ancestors = [{ node: { id: "root", label: "Home" }, path: "/" }];

const meta: Meta<typeof CatalogTemplate> = {
  title: "Templates/CatalogTemplate",
  component: CatalogTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof CatalogTemplate>;

export const Default: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/service-catalog",
    data: serviceCatalogData,
  },
};

export const Empty: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/service-catalog",
    data: { pageType: "catalog", entries: [] },
  },
};
