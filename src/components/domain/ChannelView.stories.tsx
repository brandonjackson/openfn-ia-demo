import type { Meta, StoryObj } from "@storybook/react";
import ChannelView from "./ChannelView";
import { channelDetails } from "../../fixtures/channels";
import { projects } from "../../fixtures/projects";

const channels = projects.flatMap((p) => p.components).filter((c) => c.type === "Channel");
const byId = (id: string) => channels.find((c) => c.id === id)!;

const meta: Meta<typeof ChannelView> = {
  title: "Domain/ChannelView",
  component: ChannelView,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="h-[1000px] bg-gray-50">
        <Story />
      </div>
    ),
  ],
  args: { onOpenRun: () => {} },
};

export default meta;
type Story = StoryObj<typeof ChannelView>;

function story(id: string): Story {
  const c = byId(id);
  return { args: { name: c.name, description: c.description, channel: channelDetails(c) } };
}

/** An event channel: the e-planning portal posts each submission to it. One message failed its signature check. */
export const Event: Story = story("eplanning-submission-received");

/** A write channel: the workflow opens a case through it. One message hit a duplicate. */
export const Write: Story = story("case-management-create-case");

/** A read channel, with details made up from its name. */
export const Read: Story = story("client-registry-search");

/** Without runs to load. */
export const Standalone: Story = { args: { ...story("commcare-case-updated").args, onOpenRun: undefined } };
