import type { Meta, StoryObj } from "@storybook/react";
import SystemPage from "./SystemPage";
import { withRouter } from "../stories/decorators";
import type { IANode } from "../model/ia-tree";
import type { DetailPageData } from "../model/page-data";
import { connectionOf } from "../model/connected-systems";
import { connectedSystems } from "../fixtures/connected-systems";
import { directoryMember, orgXRoad, routeService } from "../fixtures/xroad";

/** A system's record, and where its X-Road route goes when it has one, as the page's wrapper passes them. */
function systemData(id: string): Pick<DetailPageData, "system" | "xroad"> {
  const system = connectedSystems.find((s) => s.id === id)!;
  const c = connectionOf(system);
  return {
    system,
    xroad: c.method === "xroad" ? { org: orgXRoad, member: directoryMember(c.route.memberId), service: routeService(c.route) } : undefined,
  };
}

const node: IANode = {
  id: "dhis2",
  label: "DHIS2",
  description: "Health information management system for data collection and analysis.",
};

const ancestors = [
  { node: { id: "root", label: "Home" }, path: "/" },
  { node: { id: "connected-systems", label: "Systems" }, path: "/connected-systems" },
];

const detailData: DetailPageData = {
  pageType: "detail",
  ...systemData("dhis2"),
  headerBadge: { label: "Shared", variant: "shared" },
};

const meta: Meta<typeof SystemPage> = {
  title: "Pages/SystemPage",
  component: SystemPage,
  args: { onSaveSystem: async () => {}, onRevokeGrant: async () => {}, onDeleteSystem: async () => {} },
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SystemPage>;

export const SharedSystem: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/connected-systems/dhis2",
    data: detailData,
  },
};

export const PrivateSystem: Story = {
  args: {
    node: { ...node, id: "kobo-toolbox", label: "KoBoToolbox" },
    ancestors,
    currentPath: "/connected-systems/kobo-toolbox",
    data: {
      ...detailData,
      ...systemData("kobo-toolbox"),
      headerBadge: { label: "Private", variant: "private" },
    },
  },
};

/** A system reached over X-Road: its route, status track, agreement, access, headers and catalogue record. */
export const ViaXRoad: Story = {
  name: "Via X-Road",
  args: {
    node: { id: "national-id", label: "National ID verification" },
    ancestors,
    currentPath: "/connected-systems/national-id",
    data: { pageType: "detail", ...systemData("national-id"), headerBadge: { label: "Shared", variant: "shared" } },
  },
};

/** Still waiting on the data sharing agreement, so no methods are allowed yet. */
export const ViaXRoadAgreementPending: Story = {
  name: "Via X-Road (agreement pending)",
  args: {
    node: { id: "social-registry", label: "Social registry" },
    ancestors,
    currentPath: "/connected-systems/social-registry",
    data: { pageType: "detail", ...systemData("social-registry"), headerBadge: { label: "Shared", variant: "shared" } },
  },
};

/** Someone who can't change the system: no Edit, Delete or Revoke. */
export const ReadOnly: Story = {
  args: { ...SharedSystem.args, onSaveSystem: undefined, onRevokeGrant: undefined, onDeleteSystem: undefined },
};
