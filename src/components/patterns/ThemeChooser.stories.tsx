import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import ThemeChooser from "./ThemeChooser";
import { DEFAULT_THEME_ID, THEMES, type ThemeId } from "../../theme/themes";

/** The chooser with its own choice, so picking a theme shows as picked (the story doesn't re-skin). */
function Playground({ initial = DEFAULT_THEME_ID }: { initial?: ThemeId }) {
  const [themeId, setThemeId] = useState(initial);
  return (
    <div style={{ width: 312, padding: 14, background: "var(--picker-surface)", color: "var(--picker-fg)", borderRadius: 16 }}>
      <ThemeChooser themes={THEMES} themeId={themeId} onSelect={setThemeId} />
    </div>
  );
}

const meta: Meta<typeof ThemeChooser> = {
  title: "Patterns/ThemeChooser",
  component: ThemeChooser,
};

export default meta;
type Story = StoryObj<typeof ThemeChooser>;

/** Every theme, with the default picked. */
export const Default: Story = { render: () => <Playground /> };

/** Another theme picked. */
export const OtherPicked: Story = { render: () => <Playground initial={THEMES[THEMES.length - 1]!.id} /> };
