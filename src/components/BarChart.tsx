import { useState } from "react";

export interface BarDatum {
  label: string;
  value: number;
}

interface Props {
  data: BarDatum[];
  /** Names the series in tooltips and for screen readers, e.g. "runs". */
  unit: string;
  /** Bar colour, as a background class. */
  barClassName?: string;
}

/** Rounds up to a tidy axis maximum (1, 2, 5 × 10ⁿ). */
function niceMax(max: number) {
  if (max <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 5, 10].find((s) => s * pow >= max) ?? 10;
  return step * pow;
}

/**
 * Single-series vertical bar chart with a hover tooltip on each bar (the
 * whole column is the hit target, so zero-height bars still respond). The
 * card around it names the series, so there's no legend. A visually hidden
 * table carries the same values for screen readers and keyboard users.
 */
export default function BarChart({ data, unit, barClassName = "bg-indigo-500" }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  // Counts are whole numbers, so skip a half-way tick that isn't one.
  const ticks = [max, max / 2, 0].filter(Number.isInteger);

  return (
    <div>
      <div className="flex gap-3">
        {/* Y axis labels */}
        <div className="relative h-40 w-8 flex-shrink-0 text-right text-[11px] text-gray-400" aria-hidden>
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: `${(1 - t / max) * 100}%` }}
            >
              {t.toLocaleString("en-US")}
            </span>
          ))}
        </div>

        <div className="flex-1">
          <div className="relative flex h-40 items-end gap-1" aria-hidden>
            {/* Recessive gridlines */}
            {ticks.map((t) => (
              <div
                key={t}
                className={`pointer-events-none absolute inset-x-0 border-t ${
                  t === 0 ? "border-gray-300" : "border-gray-100"
                }`}
                style={{ top: `${(1 - t / max) * 100}%` }}
              />
            ))}
            {data.map((d, i) => (
              <div
                key={d.label}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                className={`relative flex h-full flex-1 items-end justify-center ${active === i ? "z-10" : "z-[1]"}`}
              >
                <div
                  className={`w-full max-w-10 rounded-t ${barClassName} ${
                    active !== null && active !== i ? "opacity-50" : ""
                  } transition-opacity`}
                  style={{ height: `${(d.value / max) * 100}%` }}
                />
                {active === i && (
                  <div
                    className="absolute z-10 whitespace-nowrap rounded-md border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm"
                    style={{ bottom: `calc(${(d.value / max) * 100}% + 4px)` }}
                  >
                    <strong className="font-semibold text-gray-900">
                      {d.value.toLocaleString("en-US")}
                    </strong>{" "}
                    <span className="text-gray-500">
                      {unit} on {d.label}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-2 flex gap-1 text-[11px] text-gray-500" aria-hidden>
            {data.map((d) => (
              <span key={d.label} className="flex-1 text-center">
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>{unit} per day</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
