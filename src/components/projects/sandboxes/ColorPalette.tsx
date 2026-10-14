import { sandboxColorPalette } from "../../../mock-data/sandboxes";
import { cn } from "../../../utils/cn";

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
      <label className="block text-sm font-medium text-slate-800 mb-2">{label}</label>
      <div className="space-y-3">
        <div
          role="radiogroup"
          className="grid grid-cols-4 sm:grid-cols-8 gap-0.5 select-none w-fit"
          aria-label="Choose a color for your sandbox"
        >
          {palette.map((hex) => (
            <label key={hex} className="group relative inline-block cursor-pointer">
              <input
                type="radio"
                name="color"
                value={hex}
                checked={hex === current}
                onChange={() => onChange(hex)}
                aria-label={hex}
                className="sr-only"
              />
              <span
                className={cn(
                  "block w-12 h-12 md:w-14 md:h-14 transition-all duration-200 rounded-xs",
                  "group-hover:scale-102 group-hover:z-10 relative"
                )}
                style={{ backgroundColor: hex }}
                aria-hidden="true"
              />
              {hex === current && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                  <span className="hero-check w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        Selected: {current}
      </p>
    </fieldset>
  );
}
