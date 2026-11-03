import type { Meta, StoryObj } from "@storybook/react";
import ServiceRecordList, { ClassificationBadge } from "./ServiceRecordList";
import { routeService } from "../mock-data/xroad";

const meta: Meta<typeof ServiceRecordList> = {
  title: "Components/ServiceRecordList",
  component: ServiceRecordList,
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof ServiceRecordList>;

export const VerifyNationalId: Story = {
  args: { record: routeService({ memberId: "moi", subsystem: "IDENTITY", service: "verify-national-id" })!.record! },
};

export const Classifications: Story = {
  render: () => (
    <div className="flex gap-2">
      <ClassificationBadge classification="Public" />
      <ClassificationBadge classification="Internal" />
      <ClassificationBadge classification="Confidential" />
      <ClassificationBadge classification="Restricted" />
    </div>
  ),
};
