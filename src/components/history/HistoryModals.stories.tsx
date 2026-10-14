import type { Meta, StoryObj } from "@storybook/react";
import { BulkCancelModal, BulkRerunModal, ExportConfirmationModal, RerunFromJobModal } from "./HistoryModals";
import { workflowJobs } from "../../mock-data/history-extra";

const meta = { title: "History/HistoryModals", component: BulkRerunModal } satisfies Meta<typeof BulkRerunModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const BulkRerun: Story = { args: { open: true, onClose: () => {}, selectedCount: 3 } };
export const BulkCancel: Story = {
  args: { open: true, onClose: () => {}, selectedCount: 2 },
  render: (args) => <BulkCancelModal {...args} />,
};
export const RerunFromJob: Story = {
  args: { open: true, onClose: () => {}, selectedCount: 2 },
  render: (args) => <RerunFromJobModal {...args} jobs={workflowJobs("wf-openhie")} />,
};
export const ExportConfirmation: Story = {
  args: { open: true, onClose: () => {}, selectedCount: 0 },
  render: (args) => <ExportConfirmationModal open={args.open} onClose={args.onClose} count={5} />,
};
