import type { Meta, StoryObj } from "@storybook/react";
import ChannelRequestTable from "./ChannelRequestTable";
import { allChannelRequests, projectChannelRequests } from "../../fixtures/history";
import { projects } from "../../fixtures/projects";

const meta: Meta<typeof ChannelRequestTable> = {
  title: "Domain/ChannelRequestTable",
  component: ChannelRequestTable,
  args: { onOpenRun: () => {} },
};

export default meta;
type Story = StoryObj<typeof ChannelRequestTable>;

export const Default: Story = { args: { requests: projectChannelRequests(projects[0]) } };

export const AcrossProjects: Story = { args: { requests: allChannelRequests(), showProject: true } };

export const Empty: Story = { args: { requests: [] } };
