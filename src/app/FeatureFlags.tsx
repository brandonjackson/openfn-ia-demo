import { useResetDemoData } from "../api/demo";
import { apiSource } from "../api/source";
import FeatureFlagPicker from "../components/domain/FeatureFlagPicker";
import { featureFlags, flagPresets, flagsParam } from "../model/feature-flags";
import { setFlag, setFlags, shareUrl, useChosenFlags, useFlags } from "./feature-flags";

/** The flag panel, fed from the flag store. Mounted once, beside the Style Picker. */
export default function FeatureFlags() {
  const chosen = useChosenFlags();
  const effective = useFlags();
  const { reset } = useResetDemoData();
  return (
    <FeatureFlagPicker
      flags={featureFlags}
      chosen={chosen}
      effective={effective}
      presets={flagPresets}
      onToggle={setFlag}
      onApplyPreset={setFlags}
      shareUrl={shareUrl(flagsParam(chosen))}
      // Reset puts the fake server back to its fixtures; on Lightning the data is Lightning's, so there's none.
      onResetData={apiSource === "fake" ? async () => void (await reset()) : undefined}
    />
  );
}
