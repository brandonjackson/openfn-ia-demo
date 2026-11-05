import type { Meta, StoryObj } from "@storybook/react";
import BackupCodes from "./BackupCodes";
import { demoBackupCodes } from "../../fixtures/user";

const meta: Meta<typeof BackupCodes> = {
  title: "Domain/BackupCodes",
  component: BackupCodes,
  parameters: { layout: "padded" },
  args: { codes: demoBackupCodes, onRegenerate: async () => {} },
};

export default meta;
type Story = StoryObj<typeof BackupCodes>;

/** Ten codes, one already used. */
export const Default: Story = {};

/** Straight after turning MFA on, or generating a new set: save them now. */
export const Fresh: Story = {
  args: { codes: demoBackupCodes.map(({ code }) => ({ code })), fresh: true },
};
