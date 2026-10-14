import type { Meta, StoryObj } from "@storybook/react";
import { DetailItem, DetailList } from "./DetailList";
import Pill from "./Pill";

const meta: Meta = { title: "Shared/DetailList" };
export default meta;
type Story = StoryObj;

export const Rows: Story = {
  render: () => (
    <DetailList className="w-80">
      <DetailItem label="Work Order" mono>
        8a1f3c2e
      </DetailItem>
      <DetailItem label="Status">
        <Pill color="green">Success</Pill>
      </DetailItem>
      <DetailItem label="Duration">4 s</DetailItem>
    </DetailList>
  ),
};

export const Grid: Story = {
  render: () => (
    <DetailList layout="grid">
      <DetailItem label="Channel Name">openhie-gateway</DetailItem>
      <DetailItem label="Destination URL" mono>
        https://hie.example.org/fhir
      </DetailItem>
      <DetailItem label="Method">POST</DetailItem>
      <DetailItem label="Status">200</DetailItem>
    </DetailList>
  ),
};
