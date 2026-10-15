import { sandboxColorPalette } from "../../../constants";
import { Label } from "../../Inputs";

/**
 * The sandbox colour picker (SandboxLive.Components.color_palette): a grid
 * of 16 swatches; the selected one shows a white check.
 */
export default function ColorPalette({
  value,
  onChange,
  label = "Color",
  palette = sandboxColorPalette,
  disabled = false,
}: {
  value: string | null;
  onChange: (hex: string) => void;
  label?: string;
  palette?: string[];
  disabled?: boolean;
}) {
  const current = value ?? palette[0];
  return (
    <fieldset disabled={disabled}>
      <Label className="mb-2 block">{label}</Label>
      <div
        role="radiogroup"
        className="grid w-fit select-none grid-cols-4 gap-0.5 sm:grid-cols-8"
        aria-label="Choose a color for your sandbox"
      >
        {palette.map((hex) => (
          <label key={hex} className="relative cursor-pointer transition-transform hover:z-10 hover:scale-102">
            {/* A swatch is the control here, so the radio itself is visually hidden. */}
            <input
              type="radio"
              name="color"
              value={hex}
              checked={hex === current}
              onChange={() => onChange(hex)}
              aria-label={hex}
              className="sr-only"
            />
            <span className="flex h-12 w-12 items-center justify-center rounded-xs md:h-14 md:w-14" style={{ backgroundColor: hex }} aria-hidden="true">
              {hex === current && <span className="hero-check h-6 w-6 text-white drop-shadow-lg" />}
            </span>
          </label>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Selected: {current}
      </p>
    </fieldset>
  );
}
