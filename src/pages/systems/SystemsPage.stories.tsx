import type { Meta, StoryObj } from "@storybook/react";
import SystemsPage from "./SystemsPage";
import { withRouter } from "../../stories/decorators";
import { connectedSystemListItems, connectedSystems, recommendedSystems } from "../../fixtures/connected-systems";
import type { IANode } from "../../model/ia-tree";
import { ecosystemRoutes, ecosystemStations, ecosystemWorkflows } from "../../fixtures/ecosystem";
import { orgXRoad, xroadDirectory } from "../../fixtures/xroad";
import { connectionOf } from "../../model/connected-systems";
import { isoAgo } from "../../model/time";
import { routeKey } from "../../model/xroad";
import type { SystemsPageData } from "./SystemsPage";
import { adaptors } from "../../fixtures/adaptors";

/** Everything the page shows on X-Road with the map on, as the wrapper passes it. */
const fullData: SystemsPageData = {
  items: connectedSystemListItems,
  adaptors,
  suggestions: recommendedSystems.slice(0, 3),
  ecosystem: { stations: ecosystemStations, workflows: ecosystemWorkflows, routes: ecosystemRoutes },
  xroad: {
    directory: xroadDirectory,
    instance: orgXRoad.instance,
    added: connectedSystems.flatMap((s) => {
      const c = connectionOf(s);
      return c.method === "xroad" ? [routeKey(c.route)] : [];
    }),
    syncedAt: isoAgo("12 minutes ago") ?? "",
  },
};

const node: IANode = {
  id: "connected-systems",
  label: "Systems",
  description: "Browse and manage all connected external systems.",
};

const ancestors = [{ node: { id: "root", label: "Home" }, path: "/" }];

const meta: Meta<typeof SystemsPage> = {
  title: "Pages/SystemsPage",
  component: SystemsPage,
  args: { onAddXRoadService: async () => {} },
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
    data: { items: connectedSystemListItems, adaptors, suggestions: recommendedSystems.slice(0, 3) },
  },
};

export const EmptyList: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/connected-systems",
    data: { items: [], adaptors, suggestions: recommendedSystems.slice(0, 3) },
  },
};

/** On X-Road: the ecosystem map, each system's connection method, and the directory of services to add. */
export const WithXRoad: Story = {
  name: "With X-Road",
  args: {
    node,
    ancestors,
    currentPath: "/connected-systems",
    data: fullData,
  },
};
