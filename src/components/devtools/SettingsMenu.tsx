import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Settings, Check, X, PanelRight } from "lucide-react";
import { useTheme } from "../../theme/theme-context";
import type { ThemeMeta } from "../../theme/themes";
import { useAnnotations } from "../../annotations/annotations-context";
import { ANNOTATIONS_PANEL_WIDTH } from "./AnnotationsPanel";

/**
 * Floating settings button in the bottom-right corner. Its menu opens and
 * closes the annotations panel and swaps the app's theme (by changing the
 * `data-theme` attribute on <html>). It slides left of the annotations
 * panel when that's open.
 *
 * The control's own chrome is styled with explicit (theme-independent)
 * colors so it stays legible no matter which theme is active; only the
 * preview swatches reflect each theme's real palette.
 */
export default function SettingsMenu({
  defaultOpen = false,
}: {
  /** Start with the panel open. Used by stories/tests; the app omits it. */
  defaultOpen?: boolean;
}) {
  const { themeId, setTheme, themes } = useTheme();
  const annotations = useAnnotations();
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
    <div
      ref={rootRef}
      data-devtools
      style={{ ...styles.root, right: annotations.open ? ANNOTATIONS_PANEL_WIDTH + 20 : 20 }}
    >
      {open && (
        <div role="dialog" aria-label="Settings" style={styles.panel}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>Settings</span>
            <button
              type="button"
              aria-label="Close settings"
              onClick={() => setOpen(false)}
              style={styles.closeBtn}
            >
              <X size={15} />
            </button>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={annotations.open}
            onClick={() => annotations.setOpen(!annotations.open)}
            style={{ ...styles.row, marginTop: 10 }}
          >
            <span style={styles.iconTile} aria-hidden="true">
              <PanelRight size={16} />
            </span>
            <span style={styles.rowText}>
              <span style={styles.rowName}>Annotations panel</span>
              <span style={styles.rowDesc}>
                Show the behaviour annotation for whatever you hover over.
              </span>
            </span>
            <span
              style={{
                ...styles.switch,
                background: annotations.open ? "#0d9488" : "#d4d4d8",
              }}
            >
              <span
                style={{
                  ...styles.knob,
                  transform: annotations.open ? "translateX(14px)" : "none",
                }}
              />
            </span>
          </button>
          <div style={styles.divider} />
          <span style={styles.sectionTitle}>Theme</span>
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
        aria-label="Open settings"
        title="Settings"
        onClick={() => setOpen((v) => !v)}
        style={styles.trigger}
      >
        <Settings size={20} />
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
        background: active ? "#f0fdfb" : hover ? "#f4f4f5" : "transparent",
        borderColor: active ? "#0d9488" : "transparent",
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
              background: theme.mode === "dark" ? "#111827" : "#e5e7eb",
              borderColor: theme.mode === "dark" ? "#111827" : "#cbd5e1",
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

/* Explicit, theme-independent styling so the control reads the same in
   every theme. (Tailwind utilities here would themselves be re-skinned.) */
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
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#121212",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
  },
  panel: {
    width: 320,
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
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
    color: "#6b7280",
    cursor: "pointer",
    padding: 4,
    borderRadius: 8,
    display: "flex",
  },
  sectionTitle: {
    display: "block",
    margin: "0 0 6px 10px",
    fontSize: 11,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  divider: { height: 1, background: "#e5e7eb", margin: "10px 0 12px" },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  switch: {
    width: 32,
    height: 18,
    borderRadius: 9999,
    padding: 2,
    flexShrink: 0,
    transition: "background 0.15s ease",
  },
  knob: {
    display: "block",
    width: 14,
    height: 14,
    borderRadius: 9999,
    background: "#ffffff",
    transition: "transform 0.15s ease",
  },
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
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
  },
  swatch: { width: 13, height: 13, borderRadius: 3 },
  rowText: { display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 },
  rowName: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13.5,
    fontWeight: 600,
    color: "#111827",
  },
  modeDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    border: "1px solid",
    display: "inline-block",
  },
  rowDesc: { fontSize: 11.5, color: "#6b7280", lineHeight: 1.35 },
  check: { color: "#0d9488", display: "flex", flexShrink: 0, width: 16 },
};
