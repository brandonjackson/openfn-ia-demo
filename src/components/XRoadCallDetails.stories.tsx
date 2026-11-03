import type { Meta, StoryObj } from "@storybook/react";
import XRoadCallDetails from "./XRoadCallDetails";

const meta: Meta<typeof XRoadCallDetails> = {
  title: "Components/XRoadCallDetails",
  component: XRoadCallDetails,
  decorators: [(Story) => <div className="w-[340px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof XRoadCallDetails>;

export const Default: Story = {
  args: {
    call: {
      client: "FJ/GOV/NRH/OPENMRS",
      clientName: "National Referral Hospital",
      messageId: "nrh-5f1c0a2e-93b4-4d1e-8c2a",
      userId: "FJ-HW-20431",
      issue: "CASE-2026-1182",
    },
  },
};

export const WithoutUserId: Story = {
  args: {
    call: { client: "FJ/GOV/NDHO/SURVEILLANCE", clientName: "Northern District Health Office", messageId: "ndho-0b7d44e1" },
  },
};
