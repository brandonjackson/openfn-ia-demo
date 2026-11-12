import Text from "../../components/primitives/Text";

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/**
 * Each scale's fill classes, written out whole so Tailwind generates every
 * step (it only emits the colours it finds in the source). They resolve to the
 * active theme's tokens, like every colour in the app.
 */
const fills: Record<string, string[]> = {
  gray: ["bg-gray-50", "bg-gray-100", "bg-gray-200", "bg-gray-300", "bg-gray-400", "bg-gray-500", "bg-gray-600", "bg-gray-700", "bg-gray-800", "bg-gray-900"],
  indigo: ["bg-indigo-50", "bg-indigo-100", "bg-indigo-200", "bg-indigo-300", "bg-indigo-400", "bg-indigo-500", "bg-indigo-600", "bg-indigo-700", "bg-indigo-800", "bg-indigo-900"],
  red: ["bg-red-50", "bg-red-100", "bg-red-200", "bg-red-300", "bg-red-400", "bg-red-500", "bg-red-600", "bg-red-700", "bg-red-800", "bg-red-900"],
  green: ["bg-green-50", "bg-green-100", "bg-green-200", "bg-green-300", "bg-green-400", "bg-green-500", "bg-green-600", "bg-green-700", "bg-green-800", "bg-green-900"],
  amber: ["bg-amber-50", "bg-amber-100", "bg-amber-200", "bg-amber-300", "bg-amber-400", "bg-amber-500", "bg-amber-600", "bg-amber-700", "bg-amber-800", "bg-amber-900"],
  yellow: ["bg-yellow-50", "bg-yellow-100", "bg-yellow-200", "bg-yellow-300", "bg-yellow-400", "bg-yellow-500", "bg-yellow-600", "bg-yellow-700", "bg-yellow-800", "bg-yellow-900"],
};

/** Yellow and amber stay light for longer, so their labels turn white later. */
const lightUntil: Record<string, number> = { yellow: 600, amber: 600 };

interface Props {
  /** The Tailwind colour, e.g. `indigo`. */
  hue: keyof typeof fills;
  /** What the colour means in the app. */
  role: string;
}

/** One colour's scale, drawn from the live theme, so it shows whatever the active theme makes of it. */
export default function ColorRamp({ hue, role }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <Text tone="strong">{hue}</Text>
        <Text tone="muted" size="xs">
          {role}
        </Text>
      </div>
      <div className="grid grid-cols-5 overflow-hidden rounded-lg ring-1 ring-gray-200 sm:grid-cols-10">
        {steps.map((step, i) => (
          <div key={step} className={`h-14 p-1.5 ${fills[hue][i]}`} title={`${hue}-${step}`}>
            <span className={`font-mono text-[10px] ${step >= (lightUntil[hue] ?? 500) ? "text-white" : "text-gray-900"}`}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
