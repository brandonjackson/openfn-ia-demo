import type { Meta, StoryObj } from "@storybook/react";
import DeleteAccountCard from "./DeleteAccountCard";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof DeleteAccountCard> = {
  title: "Profile/DeleteAccountCard",
  component: DeleteAccountCard,
  decorators: [withRouter],
  args: { to: "/profile/user-amy/delete" },
};
export default meta;
export const Default: StoryObj<typeof DeleteAccountCard> = {};
