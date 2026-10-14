import type { Meta, StoryObj } from "@storybook/react";
import Pagination from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Shared/Pagination",
  component: Pagination,
  args: { pageNumber: 1, pageSize: 10, totalEntries: 1 },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

export const OnePage: Story = {};
export const ManyPages: Story = { args: { pageNumber: 2, totalEntries: 47 } };
export const NoResults: Story = { args: { totalEntries: 0 } };
