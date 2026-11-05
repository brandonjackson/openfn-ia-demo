import { useState, type CSSProperties } from "react";
import { Check, Link2, ToggleRight, X } from "lucide-react";
import { flagParent, type FeatureFlag, type FeatureFlags, type FlagId, type FlagPreset } from "../../model/feature-flags";
import { usePopover } from "../primitives/use-popover";

interface Props {
  /** Every flag, in the order to list them. */
  flags: FeatureFlag[];
  /** Which flags are switched on, before requirements are applied. */
  chosen: FeatureFlags;
  /** Which flags are in effect: a switched-on flag whose requirement is off isn't. */
  effective: FeatureFlags;
  /** One-click sets of choices, e.g. everything on and everything off. */
  presets: FlagPreset[];
  onToggle: (id: FlagId, on: boolean) => void;
  onApplyPreset: (flags: FeatureFlags) => void;
  /** A link that opens the demo with the current choices, for "Copy link". */
  shareUrl?: string;
  /** Start with the panel open. Used by stories; the app omits it. */
  defaultOpen?: boolean;
}

/**
 * Floating control, beside the Style Picker, that turns the demo's new
 * features on and off: presets for the full vision and the plain redesign,
 * then a switch for each flag. A flag that builds on another sits nested
 * under it on a guide line; while the one it needs is off it's dimmed, says
 * what it needs, and has no effect.
 *
 * Like the Style Picker it's the demo's own chrome, not part of the product,
 * so it's styled with the theme-independent --picker-* tokens and reads the
 * same in every theme.
 */
export default function FeatureFlagPicker({
  flags,
  chosen,
  effective,
  presets,
  onToggle,
  onApplyPreset,
  shareUrl,
  defaultOpen = false,
}: Props) {
  const { open, setOpen, ref } = usePopover(defaultOpen);
  const [copied, setCopied] = useState(false);
  const groups = [...new Set(flags.map((f) => f.group))];
  const label = (id: FlagId) => flags.find((f) => f.id === id)?.label ?? id;
  const activePreset = presets.find((p) => flags.every((f) => p.flags[f.id] === chosen[f.id]));
  const offCount = flags.filter((f) => !effective[f.id]).length;

  const childrenOf = (id: FlagId) => flags.filter((f) => flagParent(f) === id);

  /** A flag and, nested under it on a guide line, the flags that build on it. */
  const renderRow = (flag: FeatureFlag, depth: number) => {
    const parent = flagParent(flag);
    const missing = flag.requires.filter((r) => !effective[r]);
    // The nesting already says a flag needs its parent, so name a missing
    // requirement only where it's the cause: switched off itself, or not the
    // flag it sits under. A flag under a parent that's itself blocked just dims.
    const causes = missing.filter((r) => r !== parent || !chosen[r]);
    const inactive = missing.length > 0;
    const children = childrenOf(flag.id);
    const requires = flag.requires.map(label);
    return (
      <li key={flag.id}>
        <label
          style={{ ...styles.row, opacity: inactive ? 0.5 : 1 }}
          title={requires.length ? `${flag.description}\n\nRequires ${requires.join(" and ")}.` : flag.description}
        >
          <input
            type="checkbox"
            checked={chosen[flag.id]}
            onChange={(e) => onToggle(flag.id, e.target.checked)}
            style={styles.checkbox}
          />
          <span style={styles.rowText}>
            <span style={styles.rowName}>{flag.label}</span>
            {causes.length > 0 && <span style={styles.needs}>Needs {causes.map(label).join(" and ")}</span>}
          </span>
        </label>
        {children.length > 0 && renderBranch(children, depth + 1)}
      </li>
    );
  };

  const renderBranch = (branch: FeatureFlag[], depth: number) => (
    <ul style={depth === 0 ? styles.ul : styles.branch}>{branch.map((f) => renderRow(f, depth))}</ul>
  );

  const copy = () => {
    if (!shareUrl) return;
    void navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div ref={ref} style={styles.root}>
      {open && (
        <div role="dialog" aria-label="Feature flags" style={styles.panel}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>Feature flags</span>
            <button type="button" aria-label="Close feature flags" onClick={() => setOpen(false)} style={styles.iconBtn}>
              <X size={15} />
            </button>
          </div>
          <p style={styles.subtitle}>
            Turn the new features off to see the redesign at today's scope. Nested features need the one above them.
            Only the two presets are looked after; other mixes are best effort.
          </p>

          <div style={styles.presets}>
            {presets.map((preset) => {
              const active = preset === activePreset;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={active}
                  title={preset.description}
                  onClick={() => onApplyPreset(preset.flags)}
                  style={{
                    ...styles.preset,
                    background: active ? "var(--picker-accent-soft)" : "transparent",
                    borderColor: active ? "var(--picker-accent)" : "var(--picker-border)",
                  }}
                >
                  {active && <Check size={13} />}
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div style={styles.list}>
            {groups.map((group) => (
              <section key={group}>
                <div style={styles.groupLabel}>{group}</div>
                {renderBranch(flags.filter((f) => f.group === group && !flagParent(f)), 0)}
              </section>
            ))}
          </div>

          {shareUrl && (
            <button type="button" onClick={copy} style={styles.copy}>
              {copied ? <Check size={14} /> : <Link2 size={14} />}
              {copied ? "Copied" : "Copy link with these flags"}
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open feature flags"
        title={offCount === 0 ? "Feature flags: all on" : `Feature flags: ${offCount} off`}
        onClick={() => setOpen((v) => !v)}
        style={styles.trigger}
      >
        <ToggleRight size={20} />
        {offCount > 0 && <span style={styles.count}>{offCount}</span>}
      </button>
    </div>
  );
}

/* Theme-independent styling, as for the Style Picker: the --picker-* tokens
   in theme.css, which no theme redefines. */
const styles: Record<string, CSSProperties> = {
  root: {
    position: "fixed",
    right: 80,
    bottom: 20,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 12,
    fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  trigger: {
    position: "relative",
    width: 48,
    height: 48,
    borderRadius: 9999,
    border: "1px solid var(--picker-trigger-border)",
    background: "var(--picker-trigger-bg)",
    color: "var(--picker-trigger-fg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 6px 20px var(--picker-shadow)",
  },
  count: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    padding: "0 5px",
    borderRadius: 9999,
    background: "var(--picker-accent)",
    color: "var(--picker-trigger-fg)",
    fontSize: 11,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    width: 340,
    maxHeight: "75vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--picker-surface)",
    color: "var(--picker-fg)",
    border: "1px solid var(--picker-border)",
    borderRadius: 16,
    boxShadow: "0 20px 50px var(--picker-panel-shadow)",
    padding: 14,
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" },
  iconBtn: {
    border: "none",
    background: "transparent",
    color: "var(--picker-muted)",
    cursor: "pointer",
    padding: 4,
    borderRadius: 8,
    display: "flex",
  },
  subtitle: { margin: "2px 0 12px", fontSize: 12, lineHeight: 1.45, color: "var(--picker-muted)" },
  presets: { display: "flex", gap: 6, marginBottom: 12 },
  preset: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: "7px 8px",
    borderRadius: 10,
    border: "1px solid var(--picker-border)",
    color: "var(--picker-fg)",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },
  list: { overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, minHeight: 0 },
  groupLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--picker-muted)",
    margin: "0 0 4px 2px",
  },
  ul: { listStyle: "none", margin: 0, padding: 0 },
  /* The flags that build on the one above: indented on a guide line. */
  branch: {
    listStyle: "none",
    margin: "0 0 2px 13px",
    padding: "0 0 0 10px",
    borderLeft: "1.5px solid var(--picker-border)",
  },
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "6px 6px",
    borderRadius: 8,
    cursor: "pointer",
  },
  checkbox: { marginTop: 2, accentColor: "var(--picker-accent)", cursor: "pointer" },
  rowText: { display: "flex", flexDirection: "column", gap: 1, minWidth: 0 },
  rowName: { fontSize: 13, fontWeight: 500 },
  needs: { fontSize: 11, color: "var(--picker-muted)" },
  copy: {
    marginTop: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--picker-border)",
    background: "var(--picker-well)",
    color: "var(--picker-fg)",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },
};
