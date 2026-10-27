import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Palette, Check, X } from "lucide-react";
import { useTheme } from "../theme/theme-context";
import type { ThemeMeta } from "../theme/themes";

/**
 * Floating control that swaps the whole app's look and feel by changing
 * the `data-theme` attribute on <html>. It re-skins every component
 * without touching their markup — functionality is never altered.
 *
 * The control's own chrome is styled with the theme-independent
 * --picker-* tokens so it stays legible no matter which theme is active; only the
 * preview swatches reflect each theme's real palette.
 */
export default function StylePicker({
  defaultOpen = false,
}: {
  /** Start with the panel open. Used by stories/tests; the app omits it. */
  defaultOpen?: boolean;
}) {
  const { themeId, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} style={styles.root}>
      {open && (
        <div role="dialog" aria-label="Choose a theme" style={styles.panel}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>Theme</span>
            <button
              type="button"
              aria-label="Close theme picker"
              onClick={() => setOpen(false)}
              style={styles.closeBtn}
            >
              <X size={15} />
            </button>
          </div>
          <p style={styles.subtitle}>
            Same components, totally different look &amp; feel.
          </p>
          <ul style={styles.list}>
            {themes.map((theme) => (
              <li key={theme.id}>
                <ThemeRow
                  theme={theme}
                  active={theme.id === themeId}
                  onSelect={() => setTheme(theme.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open theme picker"
        title="Change theme"
        onClick={() => setOpen((v) => !v)}
        style={styles.trigger}
      >
        <Palette size={20} />
      </button>
    </div>
  );
}

function ThemeRow({
  theme,
  active,
  onSelect,
}: {
  theme: ThemeMeta;
  active: boolean;
  onSelect: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styles.row,
        background: active ? "var(--picker-accent-soft)" : hover ? "var(--picker-hover)" : "transparent",
        borderColor: active ? "var(--picker-accent)" : "transparent",
      }}
    >
      <span style={styles.swatches} aria-hidden="true">
        {theme.swatches.map((color, i) => (
          <span
            key={i}
            style={{ ...styles.swatch, background: color }}
          />
        ))}
      </span>
      <span style={styles.rowText}>
        <span style={styles.rowName}>
          {theme.name}
          <span
            style={{
              ...styles.modeDot,
              background: theme.mode === "dark" ? "var(--picker-dark-dot)" : "var(--picker-border)",
              borderColor: theme.mode === "dark" ? "var(--picker-dark-dot)" : "var(--picker-light-dot-border)",
            }}
            title={theme.mode === "dark" ? "Dark" : "Light"}
          />
        </span>
        <span style={styles.rowDesc}>{theme.description}</span>
      </span>
      <span style={styles.check}>{active && <Check size={16} />}</span>
    </button>
  );
}

/* Theme-independent styling so the control reads the same in every theme:
   its colours are the --picker-* tokens in theme.css, which no theme
   redefines. (Tailwind utilities here would themselves be re-skinned.) */
const styles: Record<string, CSSProperties> = {
  root: {
    position: "fixed",
    right: 20,
    bottom: 20,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 12,
    fontFamily:
      '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  trigger: {
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
  panel: {
    width: 320,
    background: "var(--picker-surface)",
    color: "var(--picker-fg)",
    border: "1px solid var(--picker-border)",
    borderRadius: 16,
    boxShadow: "0 20px 50px var(--picker-panel-shadow)",
    padding: 14,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" },
  closeBtn: {
    border: "none",
    background: "transparent",
    color: "var(--picker-muted)",
    cursor: "pointer",
    padding: 4,
    borderRadius: 8,
    display: "flex",
  },
  subtitle: { margin: "2px 0 12px", fontSize: 12, color: "var(--picker-muted)" },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  row: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 10px",
    borderRadius: 12,
    border: "1px solid transparent",
    cursor: "pointer",
    textAlign: "left",
  },
  swatches: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 2,
    flexShrink: 0,
    padding: 3,
    borderRadius: 9,
    background: "var(--picker-well)",
    border: "1px solid var(--picker-border)",
  },
  swatch: { width: 13, height: 13, borderRadius: 3 },
  rowText: { display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 },
  rowName: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13.5,
    fontWeight: 600,
    color: "var(--picker-fg)",
  },
  modeDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    border: "1px solid",
    display: "inline-block",
  },
  rowDesc: { fontSize: 11.5, color: "var(--picker-muted)", lineHeight: 1.35 },
  check: { color: "var(--picker-accent)", display: "flex", flexShrink: 0, width: 16 },
};
