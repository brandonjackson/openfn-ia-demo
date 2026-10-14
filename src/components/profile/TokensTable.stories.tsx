import type { Meta, StoryObj } from "@storybook/react";
import TokensTable from "./TokensTable";
import { apiTokens } from "../../mock-data/tokens";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof TokensTable> = { title: "Profile/TokensTable", component: TokensTable, decorators: [withRouter] };
export default meta;
type Story = StoryObj<typeof TokensTable>;

export const WithTokens: Story = { args: { tokens: apiTokens } };
export const Empty: Story = { args: { tokens: [] } };
