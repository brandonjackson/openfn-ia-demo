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
function Playground({ initial, defaultOpen }: { initial: FeatureFlags; defaultOpen?: boolean }) {
  const [chosen, setChosen] = useState(initial);
  return (
    <div className="h-screen w-full bg-gray-50 p-8">
      <FeatureFlagPicker
        flags={featureFlags}
        chosen={chosen}
        effective={effectiveFlags(chosen)}
        presets={flagPresets}
        onToggle={(id, on) => setChosen({ ...chosen, [id]: on })}
        onApplyPreset={setChosen}
        shareUrl="https://example.org/?flags=redesign"
        defaultOpen={defaultOpen}
      />
    </div>
  );
}

const meta: Meta<typeof FeatureFlagPicker> = {
  title: "Domain/FeatureFlagPicker",
  component: FeatureFlagPicker,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof FeatureFlagPicker>;

/** The collapsed control, as it sits beside the Style Picker. */
export const Default: Story = { render: () => <Playground initial={allFlagsOn} /> };

/** Open, with every feature on: the full vision. */
export const FullVision: Story = { render: () => <Playground initial={allFlagsOn} defaultOpen /> };

/** Open, with every feature off: the redesign at today's scope. The trigger counts what's off. */
export const Redesign: Story = { render: () => <Playground initial={allFlagsOff} defaultOpen /> };

/** Connected systems off: X-Road and the Ecosystem map, nested under it, say what they need and have no effect. */
export const BlockedByRequirement: Story = {
  render: () => <Playground initial={{ ...allFlagsOn, connectedSystems: false }} defaultOpen />,
};

/** Organizations off: everything nested under it dims, and only the flags right under it say why. */
export const ParentOff: Story = {
  render: () => <Playground initial={{ ...allFlagsOn, organizations: false }} defaultOpen />,
};
