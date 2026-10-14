import type { Meta, StoryObj } from "@storybook/react";
import Disclosure from "../Disclosure";
import { channelRequests } from "../../mock-data/channel-requests";
import {
  BodyViewer,
  HeadersTable,
  MethodBadge,
  RequestPathDisplay,
  ResponseEmpty,
  SectionSizeBadge,
  StatusCodeBadge,
} from "./ChannelRequestParts";

const event = channelRequests[0].events[0];

const meta = {
  title: "History/ChannelRequestParts",
  component: Disclosure,
  args: { variant: "card" },
} satisfies Meta<typeof Disclosure>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RequestSection: Story = {
  args: { title: "Request", padded: false, children: null },
  render: (args) => (
    <Disclosure {...args}>
      <Disclosure variant="section" title="Headers">
        <HeadersTable headers={event.requestHeaders!} />
      </Disclosure>
      <Disclosure variant="section" title="Body" titleRight={<SectionSizeBadge size={152} />}>
        <BodyViewer
          preview={event.requestBodyPreview}
          hash={event.requestBodyHash}
          size={event.requestBodySize}
          headers={event.requestHeaders}
        />
      </Disclosure>
    </Disclosure>
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
      <StatusCodeBadge status={201} />
      <StatusCodeBadge status={302} />
      <StatusCodeBadge status={404} />
      <StatusCodeBadge status={502} />
      <StatusCodeBadge status={null} />
    </div>
  ),
};

export const NoResponse: Story = {
  args: { title: "Response", padded: false, children: null },
  render: (args) => (
    <Disclosure {...args}>
      <ResponseEmpty
        type="transport"
        errorCode="econnrefused"
        humanMessage="Connection refused — the destination server is not accepting connections on this port"
      />
    </Disclosure>
  ),
};
