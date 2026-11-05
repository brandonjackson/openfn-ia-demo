import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import SwatchPicker from "./SwatchPicker";
import type { BadgeTone } from "./Badge";

const meta: Meta<typeof SwatchPicker> = { title: "Primitives/SwatchPicker", component: SwatchPicker };
export default meta;
type Story = StoryObj<typeof SwatchPicker>;

function Picker() {
  const [value, setValue] = useState<BadgeTone>("green");
  return <SwatchPicker label="Colour" options={["indigo", "green", "yellow", "red", "pink", "gray"]} value={value} onChange={setValue} />;
}

export const Default: Story = { render: () => <Picker /> };
