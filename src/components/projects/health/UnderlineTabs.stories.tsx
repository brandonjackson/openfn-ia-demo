import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import UnderlineTabs from "./UnderlineTabs";

const meta: Meta<typeof UnderlineTabs> = {
  title: "Projects/Health/UnderlineTabs",
  component: UnderlineTabs,
  render: function Render() {
    const [tab, setTab] = useState("Work orders");
    return <UnderlineTabs tabs={["Work orders", "Runs"]} selected={tab} onSelect={setTab} label="Count by" />;
  },
};
export default meta;
type Story = StoryObj<typeof UnderlineTabs>;

export const Default: Story = {};
