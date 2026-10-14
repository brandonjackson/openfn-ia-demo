/** A small slate pill on a workspace card: "main", "active", or an env name. */
export default function WorkspaceBadge({ id, label }: { id?: string; label: string }) {
  return (
    <span id={id} className="inline-block px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded-full truncate max-w-32">
      {label}
    </span>
  );
}
