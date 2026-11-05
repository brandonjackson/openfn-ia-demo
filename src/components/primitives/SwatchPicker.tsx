import { Check } from "lucide-react";
import type { BadgeTone } from "./Badge";
import { swatchFills } from "./swatch-fills";

interface Props<T extends BadgeTone> {
  /** Names the group for screen readers, e.g. "Colour". */
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
}

/** A row of colours to pick one from, such as a sandbox's colour. */
export default function SwatchPicker<T extends BadgeTone>({ label, options, value, onChange }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((tone) => (
        <button
          key={tone}
          type="button"
          role="radio"
          aria-checked={tone === value}
          aria-label={tone.charAt(0).toUpperCase() + tone.slice(1)}
          onClick={() => onChange(tone)}
          className={`flex h-8 w-8 items-center justify-center rounded-full ring-offset-2 transition ${swatchFills[tone].dot} ${
            tone === value ? "ring-2 ring-gray-900" : "hover:ring-2 hover:ring-gray-300"
          }`}
        >
          {tone === value && <Check size={14} className="text-white" />}
        </button>
      ))}
    </div>
  );
}
