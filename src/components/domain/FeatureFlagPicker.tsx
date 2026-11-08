import { useState, type CSSProperties } from "react";
import { Check, Link2 } from "lucide-react";
import { flagParent, type FeatureFlag, type FeatureFlags, type FlagId, type FlagPreset } from "../../model/feature-flags";
import { pickerStyles as s } from "../primitives/picker-chrome";

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
}

/**
 * The Features section of the demo settings: turns the demo's new features
 * on and off, with presets for the full vision and the plain redesign, then a
 * switch for each flag. A flag that builds on another sits nested under it on
 * a guide line; while the one it needs is off it's dimmed, says what it
 * needs, and has no effect.
 *
 * It's the demo's own chrome, not part of the product, so it's styled with
 * the theme-independent --picker-* tokens and reads the same in every theme.
 */
export default function FeatureFlagPicker({
  flags,
  chosen,
  effective,
  presets,
  onToggle,
  onApplyPreset,
  shareUrl,
}: Props) {
  const [copied, setCopied] = useState(false);
  const groups = [...new Set(flags.map((f) => f.group))];
  const label = (id: FlagId) => flags.find((f) => f.id === id)?.label ?? id;
  const activePreset = presets.find((p) => flags.every((f) => p.flags[f.id] === chosen[f.id]));

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
    <div>
      <p style={s.subtitle}>
        Turn the new features off to see the redesign at today's scope. Nested features need the one above them. Only
        the two presets are looked after; other mixes are best effort.
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
            <div style={s.groupLabel}>{group}</div>
            {renderBranch(flags.filter((f) => f.group === group && !flagParent(f)), 0)}
          </section>
        ))}
      </div>

      {shareUrl && (
        <button type="button" onClick={copy} style={{ ...s.button, marginTop: 12 }}>
          {copied ? <Check size={14} /> : <Link2 size={14} />}
          {copied ? "Copied" : "Copy link with these flags"}
        </button>
      )}
    </div>
  );
}

/* Theme-independent styling, as for the rest of the demo settings: the
   --picker-* tokens in theme.css, which no theme redefines. */
const styles: Record<string, CSSProperties> = {
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
  list: { display: "flex", flexDirection: "column", gap: 10 },
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
};
