import type { Meta, StoryObj } from "@storybook/react";
import { Info } from "lucide-react";
import Popover from "./Popover";
import IconButton from "./IconButton";
import Button from "./Button";
import Stack from "./Stack";
import Text from "./Text";

const meta: Meta<typeof Popover> = {
  title: "Primitives/Popover",
  component: Popover,
  decorators: [
    (Story) => (
      <div className="h-72 p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    ariaLabel: "About this sandbox",
    defaultOpen: true,
    trigger: ({ open, toggle }) => (
      <IconButton icon={Info} size="md" label="About this sandbox" active={open} aria-expanded={open} aria-haspopup="dialog" onClick={toggle} />
    ),
    children: (
      <Stack gap="xs">
        <Text tone="strong">duplicate-check</Text>
        <Text tone="muted" size="xs">
          A sandbox of Project A, made 3 days ago.
        </Text>
      </Stack>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {};

/** An action at the foot, past a divider; it gets a way to close the panel. */
export const WithFooter: Story = {
  args: {
    footer: (close) => (
      <Button size="sm" variant="dark" fullWidth onClick={close}>
        Go live
      </Button>
    ),
  },
};

export const Closed: Story = { args: { defaultOpen: false } };
