import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import FeatureFlagPicker from "./FeatureFlagPicker";
import {
  allFlagsOff,
  allFlagsOn,
  effectiveFlags,
  featureFlags,
  flagPresets,
  type FeatureFlags,
} from "../../model/feature-flags";

/** The picker with its own choices, so the switches and presets work in the story. */
function Playground({ initial }: { initial: FeatureFlags }) {
  const [chosen, setChosen] = useState(initial);
  return (
    <div style={{ width: 312, padding: 14, background: "var(--picker-surface)", color: "var(--picker-fg)", borderRadius: 16 }}>
      <FeatureFlagPicker
        flags={featureFlags}
        chosen={chosen}
        effective={effectiveFlags(chosen)}
        presets={flagPresets}
        onToggle={(id, on) => setChosen({ ...chosen, [id]: on })}
        onApplyPreset={setChosen}
        shareUrl="https://example.org/?flags=redesign"
      />
    </div>
  );
}

const meta: Meta<typeof FeatureFlagPicker> = {
  title: "Domain/FeatureFlagPicker",
  component: FeatureFlagPicker,
};

export default meta;
type Story = StoryObj<typeof FeatureFlagPicker>;

/** Every feature on: the full vision. */
export const FullVision: Story = { render: () => <Playground initial={allFlagsOn} /> };

/** Every feature off: the redesign at today's scope. */
export const Redesign: Story = { render: () => <Playground initial={allFlagsOff} /> };

/** Connected systems off: X-Road and the Ecosystem map, nested under it, say what they need and have no effect. */
export const BlockedByRequirement: Story = {
  render: () => <Playground initial={{ ...allFlagsOn, connectedSystems: false }} />,
};

/** Organizations off: everything nested under it dims, and only the flags right under it say why. */
export const ParentOff: Story = {
  render: () => <Playground initial={{ ...allFlagsOn, organizations: false }} />,
};
