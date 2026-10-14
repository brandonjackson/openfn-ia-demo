import type { Meta, StoryObj } from "@storybook/react";
import TokenDeletionModal from "./TokenDeletionModal";

const meta: Meta<typeof TokenDeletionModal> = {
  title: "Profile/TokenDeletionModal",
  component: TokenDeletionModal,
  args: { id: "token-1", onClose: () => {} },
};
export default meta;
export const Default: StoryObj<typeof TokenDeletionModal> = {};
