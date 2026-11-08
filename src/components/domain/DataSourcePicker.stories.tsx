import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import DataSourcePicker, { type DataSource } from "./DataSourcePicker";

/** The picker with its own choice, so switching shows (the app reloads instead). */
function Playground({ initial, lightningAvailable, resettable }: { initial: DataSource; lightningAvailable: boolean; resettable?: boolean }) {
  const [source, setSource] = useState(initial);
  return (
    <div style={{ width: 312, padding: 14, background: "var(--picker-surface)", color: "var(--picker-fg)", borderRadius: 16 }}>
      <DataSourcePicker
        source={source}
        lightningAvailable={lightningAvailable}
        onChoose={setSource}
        onResetData={resettable ? () => new Promise((resolve) => setTimeout(resolve, 600)) : undefined}
      />
    </div>
  );
}

const meta: Meta<typeof DataSourcePicker> = {
  title: "Domain/DataSourcePicker",
  component: DataSourcePicker,
};

export default meta;
type Story = StoryObj<typeof DataSourcePicker>;

/** Anywhere but the Lightning deployment: the fixtures, with a reset; Lightning says where it's offered. */
export const FixturesOnly: Story = { render: () => <Playground initial="fixtures" lightningAvailable={false} resettable /> };

/** On the Lightning deployment, reading Lightning: no reset, since the data is Lightning's. */
export const OnLightning: Story = { render: () => <Playground initial="lightning" lightningAvailable resettable /> };

/** On the Lightning deployment, switched to the fixtures: the reset comes back. */
export const FixturesOnLightningDeployment: Story = { render: () => <Playground initial="fixtures" lightningAvailable resettable /> };
