import type { Meta, StoryObj } from "@storybook/react";
import ApiTokenTable from "./ApiTokenTable";
import { userApiTokens } from "../../fixtures/user";

const meta: Meta<typeof ApiTokenTable> = {
  title: "Domain/ApiTokenTable",
  component: ApiTokenTable,
  parameters: { layout: "padded" },
  args: { tokens: userApiTokens, onDelete: () => {} },
};

export default meta;
type Story = StoryObj<typeof ApiTokenTable>;

/** One token in use, one never used. */
export const Default: Story = {};

export const WithoutDelete: Story = {
  args: { onDelete: undefined },
};
