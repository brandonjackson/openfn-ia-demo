import { useTheme } from "../../theme/theme-context";
import type { ThemeMeta } from "../../theme/themes";
import { useAnnotations } from "../../annotations/annotations-context";
import { cn } from "../../utils/cn";
import Heading from "../Heading";
import IconButton from "../IconButton";
import { Radio } from "../Inputs";
import Popover from "../Popover";
import Toggle from "../Toggle";
import { ANNOTATIONS_PANEL_WIDTH } from "./AnnotationsPanel";

/**
 * Floating settings button in the bottom-right corner. Its panel opens and
 * closes the annotations panel and swaps the app's theme (by changing the
 * `data-theme` attribute on <html>). It slides left of the annotations
 * panel when that's open.
 *
 * Demo tooling, not Lightning UI, but built from the same primitives, so it
 * follows the active theme like everything else.
 */
export default function SettingsMenu() {
  const { themeId, setTheme, themes } = useTheme();
  const annotations = useAnnotations();

  return (
    <div data-devtools className="fixed bottom-5 z-[9999]" style={{ right: annotations.open ? ANNOTATIONS_PANEL_WIDTH + 20 : 20 }}>
      <Popover
        align="end"
        className="w-80 p-4"
        trigger={
          <IconButton
            icon="hero-cog-6-tooth"
            label="Open settings"
            title="Settings"
            data-ui="settings-trigger"
            className="h-12 w-12 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-700 hover:text-white"
          />
        }
      >
        {(close) => (
          // The panel is portalled out of the root, so it marks itself as
          // devtools too: hovering it mustn't change the annotation shown.
          <div data-devtools aria-label="Settings" className="space-y-4">
            <div className="flex items-center justify-between">
              <Heading size="sm">Settings</Heading>
              <IconButton icon="hero-x-mark" label="Close settings" title="Close" size="sm" onClick={close} />
            </div>
            <Toggle
              checked={annotations.open}
              onChange={annotations.setOpen}
              label="Annotations panel"
              description="Show the behaviour annotation for whatever you hover over."
            />
            <fieldset className="space-y-2 border-t border-gray-200 pt-4">
              <Heading as="div" size="eyebrow">
                Theme
              </Heading>
              {themes.map((theme) => (
                <Radio
                  key={theme.id}
                  name="theme"
                  checked={theme.id === themeId}
                  onChange={() => setTheme(theme.id)}
                  label={<ThemeName theme={theme} />}
                  hint={theme.description}
                />
              ))}
            </fieldset>
          </div>
        )}
      </Popover>
    </div>
  );
}

/** The theme's colour swatches, its name, and a light / dark dot. */
function ThemeName({ theme }: { theme: ThemeMeta }) {
  const dark = theme.mode === "dark";
  return (
    <span className="flex items-center gap-2 font-medium text-gray-900">
      <span className="grid grid-cols-2 gap-0.5" aria-hidden="true">
        {theme.swatches.map((color, i) => (
          <span key={i} className="h-2 w-2 rounded-xs" style={{ background: color }} />
        ))}
      </span>
      {theme.name}
      <span
        title={dark ? "Dark" : "Light"}
        className={cn("h-2 w-2 rounded-full border", dark ? "border-gray-900 bg-gray-900" : "border-gray-300 bg-gray-200")}
      />
    </span>
  );
}
