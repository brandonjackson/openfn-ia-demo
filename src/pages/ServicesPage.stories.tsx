import type { Meta, StoryObj } from "@storybook/react";
import ServicesPage from "./ServicesPage";
import { withRouter } from "../stories/decorators";
import { serviceCatalogData } from "../fixtures/service-catalog";
import type { IANode } from "../model/ia-tree";

const node: IANode = {
  id: "service-catalog",
  label: "Services",
  description: "Browse the catalog of published services.",
};

const ancestors = [{ node: { id: "root", label: "Home" }, path: "/" }];

const meta: Meta<typeof ServicesPage> = {
  title: "Pages/ServicesPage",
  component: ServicesPage,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ServicesPage>;

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

/** The methods of the systems you've added, including other members' services on X-Road. */
export const ServicesWeUse: Story = {
  args: { ...Default.args, initialView: "use" },
};
