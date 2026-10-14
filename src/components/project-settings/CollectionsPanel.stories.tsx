import type { Meta, StoryObj } from "@storybook/react";
import CollectionsPanel from "./CollectionsPanel";
import { collections } from "../../mock-data/project-settings";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof CollectionsPanel> = {
  title: "Project settings/CollectionsPanel",
  component: CollectionsPanel,
  decorators: [withRouter],
  args: { projectId: collections[0].projectId, initialCollections: collections, canCreateCollection: true },
};
export default meta;
type Story = StoryObj<typeof CollectionsPanel>;

export const WithCollections: Story = {};
export const Empty: Story = { args: { initialCollections: [] } };
export const Sandbox: Story = { args: { sandbox: true } };
