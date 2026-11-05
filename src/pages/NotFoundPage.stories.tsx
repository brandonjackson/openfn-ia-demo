import type { Meta, StoryObj } from "@storybook/react";
import NotFoundPage from "./NotFoundPage";

const meta: Meta<typeof NotFoundPage> = {
  title: "Pages/NotFoundPage",
  component: NotFoundPage,
};

export default meta;
type Story = StoryObj<typeof NotFoundPage>;

/** No page lives at the URL. */
export const NoPage: Story = {
  args: { path: "/nowhere", reason: "page" },
};

/** The page exists, but the project it names doesn't. */
export const NoData: Story = {
  args: { path: "/projects/no-such-project/workflows", reason: "data" },
};
