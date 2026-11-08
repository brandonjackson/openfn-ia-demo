import { useResetDemoData } from "../api/demo";
import { apiSource, chooseApiSource, lightningAvailable } from "../api/source";
import FloatingSettings from "../components/patterns/FloatingSettings";
import ThemeChooser from "../components/patterns/ThemeChooser";
import FeatureFlagPicker from "../components/domain/FeatureFlagPicker";
import DataSourcePicker from "../components/domain/DataSourcePicker";
import { featureFlags, flagPresets, flagsParam } from "../model/feature-flags";
import { useTheme } from "../theme/theme-context";
import { setFlag, setFlags, shareUrl, useChosenFlags, useFlags } from "./feature-flags";

/**
 * The demo's settings, mounted once in the corner of every screen: its
 * theme, its feature flags, and where its data comes from.
 */
export default function DemoSettings() {
  const { themeId, setTheme, themes } = useTheme();
  const chosen = useChosenFlags();
  const effective = useFlags();
  const { reset } = useResetDemoData();
  const offCount = featureFlags.filter((f) => !effective[f.id]).length;

  return (
    <FloatingSettings
      title="Demo settings"
      badge={offCount}
      hint={offCount ? `Demo settings: ${offCount} feature ${offCount === 1 ? "flag" : "flags"} off` : "Demo settings"}
      sections={[
        { id: "theme", label: "Theme", content: <ThemeChooser themes={themes} themeId={themeId} onSelect={setTheme} /> },
        {
          id: "features",
          label: "Features",
          content: (
            <FeatureFlagPicker
              flags={featureFlags}
              chosen={chosen}
              effective={effective}
              presets={flagPresets}
              onToggle={setFlag}
              onApplyPreset={setFlags}
              shareUrl={shareUrl(flagsParam(chosen))}
            />
          ),
        },
        {
          id: "data",
          label: "Data",
          content: (
            <DataSourcePicker
              source={apiSource === "lightning" ? "lightning" : "fixtures"}
              lightningAvailable={lightningAvailable}
              onChoose={(source) => {
                chooseApiSource(source === "lightning" ? "lightning" : "fake");
                window.location.reload();
              }}
              // Reset puts the fake server back to its fixtures; on Lightning the data is Lightning's.
              onResetData={apiSource === "fake" ? async () => void (await reset()) : undefined}
            />
          ),
        },
      ]}
    />
  );
}
