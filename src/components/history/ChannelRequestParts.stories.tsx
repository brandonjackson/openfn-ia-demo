import type { Meta, StoryObj } from "@storybook/react";
import { channelRequests } from "../../mock-data/channel-requests";
import {
  BodyViewer,
  DisclosureSection,
  HeadersTable,
  MethodBadge,
  RequestPathDisplay,
  ResponseEmpty,
  StatusCodeBadge,
  StatusCodeDisplay,
  SubSection,
} from "./ChannelRequestParts";

const event = channelRequests[0].events[0];

const meta = { title: "History/ChannelRequestParts", component: DisclosureSection } satisfies Meta<
  typeof DisclosureSection
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RequestSection: Story = {
  args: { title: "Request", padded: false, children: null },
  render: (args) => (
    <DisclosureSection {...args}>
      <SubSection title="Headers">
        <HeadersTable headers={event.requestHeaders!} />
      </SubSection>
      <SubSection title="Body" titleRight={<span className="text-[11px] text-secondary-400 font-mono">152 B</span>}>
        <BodyViewer
          preview={event.requestBodyPreview}
          hash={event.requestBodyHash}
          size={event.requestBodySize}
          headers={event.requestHeaders}
        />
      </SubSection>
    </DisclosureSection>
  ),
};

export const Collapsed: Story = {
  args: { title: "Context", defaultOpen: false, children: <p className="text-sm">Hidden</p> },
};

export const Badges: Story = {
  args: { title: "", children: null },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <MethodBadge method="POST" />
      <MethodBadge method="GET" />
      <MethodBadge method="DELETE" />
      <RequestPathDisplay event={channelRequests[1].events[0]} />
      <StatusCodeDisplay status={201} />
      <StatusCodeDisplay status={404} />
      <StatusCodeDisplay status={null} />
      <StatusCodeBadge status={201} />
      <StatusCodeBadge status={502} />
    </div>
  ),
};

export const NoResponse: Story = {
  args: { title: "Response", padded: false, children: null },
  render: (args) => (
    <DisclosureSection {...args}>
      <ResponseEmpty
        type="transport"
        errorCode="econnrefused"
        humanMessage="Connection refused — the destination server is not accepting connections on this port"
      />
    </DisclosureSection>
  ),
};
