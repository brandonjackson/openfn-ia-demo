import type { Meta, StoryObj } from "@storybook/react";
import BackupCodesCard from "./BackupCodesCard";
import { backupCodes } from "../../mock-data/tokens";

const meta: Meta<typeof BackupCodesCard> = { title: "Profile/BackupCodesCard", component: BackupCodesCard, args: { codes: backupCodes } };
export default meta;
export const Default: StoryObj<typeof BackupCodesCard> = {};
