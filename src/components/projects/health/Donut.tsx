import { Link } from "react-router-dom";
import { EMPTY, FRAME, percent } from "./palette";

export interface Slice {
  key: string;
  label: string;
  color: string;
  value: number;
  /** Where the work orders this slice counts can be read. */
  href: string;
}

const SIZE = 220;
const C = SIZE / 2;
const OUTER = 80;
const INNER = 60;

/** A point on a circle, counter-clockwise from 3 o'clock (Recharts' default). */
const at = (r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return [C + r * Math.cos(rad), C - r * Math.sin(rad)] as const;
};

const arc = (from: number, to: number) => {
  const large = to - from > 180 ? 1 : 0;
  const [ox0, oy0] = at(OUTER, from);
  const [ox1, oy1] = at(OUTER, to);
  const [ix1, iy1] = at(INNER, to);
  const [ix0, iy0] = at(INNER, from);
  return `M ${ox0} ${oy0} A ${OUTER} ${OUTER} 0 ${large} 0 ${ox1} ${oy1} L ${ix1} ${iy1} A ${INNER} ${INNER} 0 ${large} 1 ${ix0} ${iy0} Z`;
};

/**
 * A part-to-whole ring with a headline figure in the middle and an always-on
 * legend (assets/js/health/charts/Donut.tsx). Drawn as plain SVG here in place
 * of Recharts; hovering a wedge shows its count and share.
 */
export default function Donut({
  slices,
  emptyMessage,
  centre,
}: {
  slices: Slice[];
  emptyMessage: string;
  centre: (total: number) => { value: string; label: string };
}) {
  const total = slices.reduce((sum, { value }) => sum + value, 0);
  if (total === 0) return <p className={EMPTY}>{emptyMessage}</p>;

  const drawn = slices.filter((s) => s.value > 0);
  let angle = 0;
  const middle = centre(total);

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className={`${FRAME} relative`}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full" aria-hidden="true">
          {drawn.length === 1 ? (
            <circle cx={C} cy={C} r={(OUTER + INNER) / 2} fill="none" stroke={drawn[0].color} strokeWidth={OUTER - INNER}>
              <title>{`${drawn[0].label}: ${drawn[0].value.toLocaleString()} (${percent(drawn[0].value, total)})`}</title>
            </circle>
          ) : (
            drawn.map((s) => {
              const from = angle;
              angle += (s.value / total) * 360;
              return (
                <path key={s.key} d={arc(from, angle)} fill={s.color} stroke="#fff" strokeWidth={2} className="cursor-pointer">
                  <title>{`${s.label}: ${s.value.toLocaleString()} (${percent(s.value, total)})`}</title>
                </path>
              );
            })
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-gray-900">{middle.value}</span>
          <span className="text-xs text-gray-500">{middle.label}</span>
        </div>
      </div>
      <ul className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-gray-700">
        {slices.map(({ key, label, color, value, href }) => (
          <li key={key}>
            <Link to={href} className="flex items-center gap-1.5 rounded-xs">
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{label}</span>{" "}
              <span className="font-medium tabular-nums text-gray-900">{value.toLocaleString()}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
