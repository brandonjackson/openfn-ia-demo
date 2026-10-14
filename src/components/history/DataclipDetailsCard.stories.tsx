import type { Meta, StoryObj } from "@storybook/react";
import { findDataclip } from "../../mock-data/history";
import DataclipDetailsCard, { DataclipBodyCard } from "./DataclipDetailsCard";
import JsonViewer from "./JsonViewer";

const meta = { title: "History/DataclipDetailsCard", component: DataclipDetailsCard } satisfies Meta<
  typeof DataclipDetailsCard
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HttpRequest: Story = { args: { dataclip: findDataclip("dc-7f3a91")! } };
export const Wiped: Story = { args: { dataclip: findDataclip("dc-wiped")! } };

export const BodyCard: Story = {
  args: { dataclip: findDataclip("dc-7f3a91")! },
  render: (args) => (
    <DataclipBodyCard dataclip={args.dataclip}>
      <JsonViewer value={args.dataclip.body} />
    </DataclipBodyCard>
  ),
};
export const WipedBodyCard: Story = {
  args: { dataclip: findDataclip("dc-wiped")! },
  render: (args) => <DataclipBodyCard dataclip={args.dataclip} />,
};
