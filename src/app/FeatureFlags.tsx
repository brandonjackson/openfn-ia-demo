import FeatureFlagPicker from "../components/patterns/FeatureFlagPicker";
import { featureFlags, flagPresets, flagsParam } from "../model/feature-flags";
import { setFlag, setFlags, shareUrl, useChosenFlags, useFlags } from "./feature-flags";

/** The flag panel, fed from the flag store. Mounted once, beside the Style Picker. */
export default function FeatureFlags() {
  const chosen = useChosenFlags();
  const effective = useFlags();
  return (
    <FeatureFlagPicker
      flags={featureFlags}
      chosen={chosen}
      effective={effective}
      presets={flagPresets}
      onToggle={setFlag}
      onApplyPreset={setFlags}
      shareUrl={shareUrl(flagsParam(chosen))}
    />
  );
}
