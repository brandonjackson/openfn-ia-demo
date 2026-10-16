import type { Meta, StoryObj } from "@storybook/react";
import TokensPage from "./TokensPage";
import { apiTokens } from "../../mock-data/tokens";
import { withCanvas, withRouter } from "../../stories/decorators";

const meta: Meta<typeof TokensPage> = {
  title: "Pages/Profile/TokensPage",
  component: TokensPage,
  // PageContent fills its parent, so give it a screen to fill.
  decorators: [withRouter, withCanvas("h-screen")],
  parameters: { layout: "fullscreen" },
  args: {
    tokens: apiTokens,
    newToken: null,
    tokenId: null,
    onGenerate: async () => {},
    onDelete: async () => {},
    onClose: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TokensPage>;

export const WithTokens: Story = {};
export const Empty: Story = { args: { tokens: [] } };
export const NewToken: Story = { args: { newToken: "demo.fake-token-not-real.QrStU-24680" } };
export const DeleteModalOpen: Story = { args: { tokenId: apiTokens[0].id } };
