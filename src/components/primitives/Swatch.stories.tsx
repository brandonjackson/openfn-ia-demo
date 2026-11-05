import type { Meta, StoryObj } from "@storybook/react";
import { FlaskConical } from "lucide-react";
import Swatch from "./Swatch";
import Inline from "./Inline";

const meta: Meta<typeof Swatch> = { title: "Primitives/Swatch", component: Swatch };
export default meta;
type Story = StoryObj<typeof Swatch>;

export const Dot: Story = { args: { tone: "green", label: "Green" } };
export const Tile: Story = { args: { tone: "pink", size: "tile", icon: FlaskConical } };
export const AllColours: Story = {
  render: () => (
    <Inline>
      {(["indigo", "green", "yellow", "red", "pink", "gray"] as const).map((t) => (
        <Swatch key={t} tone={t} size="tile" icon={FlaskConical} label={t} />
      ))}
    </Inline>
  ),
};
