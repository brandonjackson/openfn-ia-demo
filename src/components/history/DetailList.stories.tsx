import type { Meta, StoryObj } from "@storybook/react";
import { DetailItem, DetailList } from "./DetailList";
import StatePill from "./StatePill";

const meta = { title: "History/DetailList", component: DetailList } satisfies Meta<typeof DetailList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RunDetails: Story = {
  args: { children: null },
  render: () => (
    <div className="w-96">
      <DetailList>
        <DetailItem label="Workflow">
          <a className="text-primary-400 hover:text-primary-500">OpenHIE Workflow</a>
        </DetailItem>
        <DetailItem label="Started by">Webhook trigger</DetailItem>
        <DetailItem label="Duration">212 ms</DetailItem>
        <DetailItem label="Status">
          <StatePill state="success" />
        </DetailItem>
      </DetailList>
    </div>
  ),
};
