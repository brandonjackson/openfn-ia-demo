import type { Meta, StoryObj } from "@storybook/react";
import { withRouter } from "../../stories/decorators";
import WipedDataViewer from "./WipedDataViewer";

const meta = {
  title: "History/WipedDataViewer",
  component: WipedDataViewer,
  decorators: [withRouter],
} satisfies Meta<typeof WipedDataViewer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const InputCanEdit: Story = { args: { dataLabel: "input", projectId: "p", canEditDataRetention: true } };
export const OutputViewer: Story = {
  args: { dataLabel: "output", projectId: "p", canEditDataRetention: false, adminContacts: ["demo@openfn.org"] },
};
export const ChannelRequest: Story = {
  args: { dataLabel: "request_response", projectId: "p", canEditDataRetention: true },
};
