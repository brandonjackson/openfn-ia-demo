import type { Meta, StoryObj } from "@storybook/react";
import FirstSetupShell from "./FirstSetupShell";
import Header from "../Header";
import { Centered, PageContent } from "../PageContent";

const meta: Meta<typeof FirstSetupShell> = {
  title: "Auth/FirstSetupShell",
  component: FirstSetupShell,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof FirstSetupShell>;

export const Default: Story = {
  args: {
    children: (
      <PageContent header={<Header title="Setup" loggedOut />}>
        <Centered>
          <p>Page content</p>
        </Centered>
      </PageContent>
    ),
  },
};
