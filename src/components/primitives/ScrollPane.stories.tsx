import type { Meta, StoryObj } from "@storybook/react";
import ScrollPane from "./ScrollPane";
import Card from "./Card";
import SectionHeading from "./SectionHeading";

const meta: Meta<typeof ScrollPane> = {
  title: "Primitives/ScrollPane",
  component: ScrollPane,
  decorators: [(Story) => <div style={{ height: 360 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ScrollPane>;

export const Default: Story = {
  render: () => (
    <ScrollPane>
      <SectionHeading title="A view in a pane" description="It scrolls inside the region it fills." />
      {Array.from({ length: 6 }, (_, i) => (
        <Card key={i} title={`Section ${i + 1}`} description="Content that runs past the bottom of the pane." />
      ))}
    </ScrollPane>
  ),
};

export const Narrow: Story = {
  render: () => (
    <ScrollPane width="narrow">
      <SectionHeading title="A short column" description="For a checklist or a few lines of text, which read badly stretched wide." />
      <Card title="One card" description="It keeps to a comfortable reading width." />
    </ScrollPane>
  ),
};
