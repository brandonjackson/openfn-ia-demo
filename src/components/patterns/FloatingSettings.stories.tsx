import type { Meta, StoryObj } from "@storybook/react";
import FloatingSettings from "./FloatingSettings";

const sections = [
  { id: "one", label: "First", content: <p style={{ fontSize: 13, margin: 0 }}>The first section's content.</p> },
  { id: "two", label: "Second", content: <p style={{ fontSize: 13, margin: 0 }}>The second section's content.</p> },
  { id: "three", label: "Third", content: <p style={{ fontSize: 13, margin: 0 }}>The third section's content.</p> },
];

const meta: Meta<typeof FloatingSettings> = {
  title: "Patterns/FloatingSettings",
  component: FloatingSettings,
  parameters: { layout: "fullscreen" },
  args: { title: "Demo settings", sections },
  render: (args) => (
    <div className="h-screen w-full bg-gray-50 p-8">
      <FloatingSettings {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof FloatingSettings>;

/** The collapsed button, as it sits in the corner of every screen. */
export const Default: Story = {};

/** Open, on its first tab. */
export const Open: Story = { args: { defaultOpen: true } };

/** Open on another tab. */
export const OpenOnSection: Story = { args: { defaultOpen: true, defaultSection: "three" } };

/** With a count on the button, e.g. how many feature flags are off. */
export const WithBadge: Story = { args: { badge: 3, hint: "Demo settings: 3 feature flags off" } };
