import type { Meta, StoryObj } from "@storybook/react";
import DetailTemplate from "./DetailTemplate";
import { withRouter } from "../stories/decorators";
import type { IANode } from "../ia-tree";
import type { DetailPageData } from "../page-data";

const node: IANode = {
  id: "dhis2",
  label: "DHIS2",
  description: "Health information management system for data collection and analysis.",
};

const ancestors = [
  { node: { id: "root", label: "Home" }, path: "/" },
  { node: { id: "connected-systems", label: "Connected Systems" }, path: "/connected-systems" },
];

const detailData: DetailPageData = {
  pageType: "detail",
  systemId: "dhis2",
  headerBadge: { label: "Shared", variant: "shared" },
  sections: [
    {
      id: "channels",
      title: "Channels",
      display: "cards",
      items: [
        {
          id: "ch-write",
          name: "Upsert tracked entity",
          description: "Create or update a tracked entity instance in DHIS2.",
          metadata: { channelType: "write" },
        },
        {
          id: "ch-read",
          name: "Get tracked entities",
          description: "Retrieve tracked entities matching a query.",
          metadata: { channelType: "read" },
        },
        {
          id: "ch-event",
          name: "Tracked entity updated",
          description: "Fires whenever a tracked entity is updated in DHIS2.",
          metadata: { channelType: "event" },
        },
      ],
    },
  ],
};

const meta: Meta<typeof DetailTemplate> = {
  title: "Templates/DetailTemplate",
  component: DetailTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof DetailTemplate>;

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
      systemId: "kobo-toolbox",
      headerBadge: { label: "Private", variant: "private" },
      sections: [
        {
          id: "channels",
          title: "Channels",
          display: "cards",
          items: [
            {
              id: "ch-read",
              name: "Get survey data",
              description: "Retrieve survey submissions.",
              metadata: { channelType: "read" },
            },
          ],
        },
      ],
    },
  },
};

export const NoChannels: Story = {
  args: {
    node: { ...node, id: "google-sheets", label: "Google Sheets" },
    ancestors,
    currentPath: "/connected-systems/google-sheets",
    data: {
      pageType: "detail",
      systemId: "google-sheets",
      headerBadge: { label: "Shared", variant: "shared" },
      sections: [],
    },
  },
};
