export interface DonutSlice {
  key: string;
  label: string;
  value: number;
  /** The wedge's colour, as a fill class, e.g. "fill-green-600". */
  fillClassName: string;
  /** The same colour for its legend dot, as a background class. */
  dotClassName: string;
}

const SIZE = 160;
const C = SIZE / 2;
const OUTER = 70;
const INNER = 52;

/** A point on the ring, clockwise from 12 o'clock. */
const at = (r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(rad), C + r * Math.sin(rad)] as const;
};

const arc = (from: number, to: number) => {
  const large = to - from > 180 ? 1 : 0;
  const [ox0, oy0] = at(OUTER, from);
  const [ox1, oy1] = at(OUTER, to);
  const [ix1, iy1] = at(INNER, to);
  const [ix0, iy0] = at(INNER, from);
  return `M ${ox0} ${oy0} A ${OUTER} ${OUTER} 0 ${large} 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${INNER} ${INNER} 0 ${large} 0 ${ix0} ${iy0} Z`;
};

/** A share to one decimal, never rounding a small slice away to 0% or a large one up to 100%. */
const percent = (value: number, total: number) => {
  const share = (value / total) * 100;
  if (value > 0 && share < 0.05) return "<0.1%";
  if (value < total && share >= 99.95) return ">99.9%";
  return `${share.toFixed(1)}%`;
};

/**
 * A part-to-whole ring with a headline figure in the middle and a legend
 * underneath that always shows each slice's count. Hovering a wedge gives its
 * count and share. With nothing to show it says so instead.
 */
export default function Donut({
  slices,
  centre,
  emptyMessage = "Nothing to show",
}: {
  slices: DonutSlice[];
  /** The figure in the middle, e.g. the success rate. */
  centre: { value: string; label: string };
  emptyMessage?: string;
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return <p className="flex min-h-40 items-center justify-center text-center text-sm text-gray-400">{emptyMessage}</p>;
  }

  const drawn = slices.filter((s) => s.value > 0);
  let angle = 0;

  return (
    <div className="mx-auto w-full max-w-xs">
      <div className="relative mx-auto h-40 w-40">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full" aria-hidden>
          {drawn.length === 1 ? (
            // A whole ring, as two halves, with no seam between them.
            <g className={drawn[0].fillClassName}>
              <title>{`${drawn[0].label}: ${drawn[0].value} (100%)`}</title>
              <path d={arc(0, 180)} />
              <path d={arc(180, 360)} />
            </g>
          ) : (
            drawn.map((s) => {
              const from = angle;
              angle += (s.value / total) * 360;
              return (
                <path key={s.key} d={arc(from, angle)} strokeWidth={2} className={`stroke-white ${s.fillClassName}`}>
                  <title>{`${s.label}: ${s.value} (${percent(s.value, total)})`}</title>
                </path>
              );
            })
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums text-gray-900">{centre.value}</span>
          <span className="text-xs text-gray-500">{centre.label}</span>
        </div>
      </div>
      <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-gray-700">
        {slices.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span aria-hidden className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${s.dotClassName}`} />
            {s.label} <span className="font-medium tabular-nums text-gray-900">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
