import { cn } from "../utils/cn";

interface Props {
  label: string;
  /** Hero icon class, e.g. `hero-folder`. */
  icon?: string;
  /** Event dispatched on `document.body`; the matching Picker listens for it. */
  openEvent?: string;
  isSandbox?: boolean;
  /** Accent icon in sandbox mode. */
  accentIcon?: string;
  /** Sandbox accent background. */
  color?: string | null;
}

/**
 * The project picker trigger at the start of the breadcrumbs (Lightning's
 * assets/js/picker/PickerButton.tsx). Sandboxes render in their own colour
 * with a beaker, and a deep path is shortened to its last two parts.
 */
export default function PickerButton({
  label,
  icon = "hero-folder",
  openEvent = "open-project-picker",
  isSandbox = false,
  accentIcon = "hero-beaker",
  color,
}: Props) {
  const parts = label.split("/");
  const truncated = isSandbox && parts.length > 2;
  const visible = truncated ? parts.slice(-2) : parts;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        document.body.dispatchEvent(new CustomEvent(openEvent));
      }}
      title={truncated ? parts.join(" > ") : undefined}
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors",
        !isSandbox && "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400",
        isSandbox && "text-white border border-transparent hover:opacity-90"
      )}
      style={isSandbox ? { backgroundColor: color ?? "var(--color-primary-600)" } : undefined}
    >
      <span className={cn("h-4 w-4", isSandbox ? `${accentIcon} text-white/80` : `${icon} text-gray-500`)} />
      <span>
        {isSandbox && parts.length > 1 ? (
          <>
            {truncated && <span className="opacity-50">…</span>}
            {visible.map((part, i) => (
              <span key={i}>
                {(i > 0 || truncated) && <span>:</span>}
                {part}
              </span>
            ))}
          </>
        ) : (
          label
        )}
      </span>
      <span className={cn("hero-chevron-down h-4 w-4 shrink-0", isSandbox ? "text-white/80" : "text-gray-400")} />
    </button>
  );
}
