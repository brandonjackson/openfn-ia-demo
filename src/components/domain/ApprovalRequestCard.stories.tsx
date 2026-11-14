import type { Meta, StoryObj } from "@storybook/react";
import ApprovalRequestCard from "./ApprovalRequestCard";
import { waitingRun } from "../../fixtures/runs";
import { FormError } from "../../model/form-error";

const request = waitingRun.waitingFor!;

const meta: Meta<typeof ApprovalRequestCard> = {
  title: "Domain/ApprovalRequestCard",
  component: ApprovalRequestCard,
  args: { request, onAnswer: () => new Promise((resolve) => setTimeout(resolve, 600)) },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ApprovalRequestCard>;

/** A hardship grant waiting on the district officer: Reject asks for a comment first. */
export const Waiting: Story = {};

/** For someone who can't answer it: it only says what it's waiting for. */
export const ReadOnly: Story = { args: { onAnswer: undefined } };

/** Answering is refused, say because someone else answered first. */
export const Refused: Story = {
  args: {
    onAnswer: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      throw new FormError("This run isn't waiting for an answer any more.");
    },
  },
};
