const tones = ["bg-violet-500", "bg-amber-500", "bg-emerald-500", "bg-sky-500", "bg-rose-500"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface Props {
  /** People's names, most relevant first. */
  names: string[];
  /** How many avatars to draw before "+ N more". */
  max?: number;
}

/**
 * A row of overlapping initials for the people on something (a workflow's
 * editors), with "+ N more" for the rest.
 */
export default function AvatarStack({ names, max = 3 }: Props) {
  if (names.length === 0) return <span className="text-sm text-gray-400">No one yet</span>;
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;

  return (
    <span className="inline-flex items-center gap-2" title={names.join(", ")}>
      <span className="flex -space-x-0.5">
        {shown.map((name, i) => (
          <span
            key={name}
            aria-label={name}
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white ${tones[i % tones.length]}`}
          >
            {initials(name)}
          </span>
        ))}
      </span>
      {rest > 0 && <span className="whitespace-nowrap text-xs text-gray-500">+ {rest} more</span>}
    </span>
  );
}
