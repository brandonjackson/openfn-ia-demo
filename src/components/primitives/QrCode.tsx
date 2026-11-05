const SIZE = 25;

/** A small seeded random number generator, so one value always draws the same pattern. */
function seeded(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/** Whether a cell belongs to one of the three corner squares a scanner lines up on. */
function finder(x: number, y: number): boolean | undefined {
  for (const [ox, oy] of [
    [0, 0],
    [SIZE - 7, 0],
    [0, SIZE - 7],
  ]) {
    const dx = x - ox;
    const dy = y - oy;
    if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) {
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false;
      const ring = Math.min(dx, dy, 6 - dx, 6 - dy);
      return ring !== 1;
    }
  }
  return undefined;
}

interface Props {
  /** What the code stands for, e.g. an otpauth:// link. The same value always draws the same picture. */
  value: string;
  /** Read by screen readers, e.g. "QR code for your authenticator app". */
  label: string;
  /** Width and height in pixels. */
  size?: number;
}

/**
 * A QR-code-shaped picture of a value. It's a stand-in drawn from the value,
 * not a scannable code: the demo has no server to mint a real secret, so it
 * always sits beside the value in text.
 */
export default function QrCode({ value, label, size = 160 }: Props) {
  const random = seeded(value);
  const cells: [number, number][] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const f = finder(x, y);
      if (f ?? random() > 0.52) cells.push([x, y]);
    }
  }
  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`}
      className="rounded-md border border-gray-200"
      shapeRendering="crispEdges"
    >
      <rect x={-2} y={-2} width={SIZE + 4} height={SIZE + 4} className="fill-white" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} className="fill-gray-900" />
      ))}
    </svg>
  );
}
