import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Pagination from "./Pagination";
import { auditEvents, auditPageSize } from "../../fixtures/admin";

const meta: Meta<typeof Pagination> = {
  title: "Primitives/Pagination",
  component: Pagination,
  parameters: { layout: "padded" },
  args: { page: 1, pageSize: auditPageSize, total: auditEvents.length, noun: "events", onChange: () => {} },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const FirstPage: Story = {};

export const LastPage: Story = { args: { page: Math.ceil(auditEvents.length / auditPageSize) } };

/** Click through the pages. */
export const Interactive: Story = {
  render: function Render(args) {
    const [page, setPage] = useState(1);
    return <Pagination {...args} page={page} onChange={setPage} />;
  },
};

/** Everything fits on one page, so there's nothing to draw. */
export const OnePage: Story = { args: { total: 4 } };
