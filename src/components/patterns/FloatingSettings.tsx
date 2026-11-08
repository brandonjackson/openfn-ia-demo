import { useState, type CSSProperties, type ReactNode } from "react";
import { Settings, X } from "lucide-react";
import { usePopover } from "../primitives/use-popover";
import { pickerFont } from "../primitives/picker-chrome";

/** One tab of the panel. */
export interface FloatingSettingsSection {
  id: string;
  label: string;
  content: ReactNode;
}

interface Props {
  /** The panel's heading. */
  title: string;
  /** The tabs, in order; the first is shown first. */
  sections: FloatingSettingsSection[];
  /** A small count on the button, e.g. how many feature flags are off. Left out, none. */
  badge?: number;
  /** The button's tooltip. */
  hint?: string;
  /** Start with the panel open. Used by stories; the app omits it. */
  defaultOpen?: boolean;
  /** The tab to show first, by id. */
  defaultSection?: string;
}

/**
 * A round settings button pinned to the bottom-right corner, opening a panel
 * of tabbed sections above it: the demo's own controls (theme, feature flags,
 * data), whose content comes in through `sections`.
 *
 * It's the demo's chrome, not part of the product, so it's styled with the
 * theme-independent --picker-* tokens and reads the same in every theme.
 */
export default function FloatingSettings({ title, sections, badge, hint, defaultOpen = false, defaultSection }: Props) {
  const { open, setOpen, ref } = usePopover(defaultOpen);
  const [tab, setTab] = useState(defaultSection ?? sections[0]?.id);
  const current = sections.find((s) => s.id === tab) ?? sections[0];

  return (
    <div ref={ref} style={styles.root}>
      {open && (
        <div role="dialog" aria-label={title} style={styles.panel}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>{title}</span>
            <button type="button" aria-label={`Close ${title.toLowerCase()}`} onClick={() => setOpen(false)} style={styles.iconBtn}>
              <X size={15} />
            </button>
          </div>
          <div role="tablist" aria-label={title} style={styles.tabs}>
            {sections.map((s) => {
              const active = s.id === current?.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  id={`floating-settings-tab-${s.id}`}
                  aria-selected={active}
                  aria-controls="floating-settings-panel"
                  onClick={() => setTab(s.id)}
                  style={{
                    ...styles.tab,
                    background: active ? "var(--picker-surface)" : "transparent",
                    color: active ? "var(--picker-fg)" : "var(--picker-muted)",
                    boxShadow: active ? "0 1px 2px var(--picker-shadow)" : "none",
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <div role="tabpanel" id="floating-settings-panel" aria-labelledby={current && `floating-settings-tab-${current.id}`} style={styles.body}>
            {current?.content}
          </div>
        </div>
      )}

      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Open ${title.toLowerCase()}`}
        title={hint ?? title}
        onClick={() => setOpen((v) => !v)}
        style={styles.trigger}
      >
        <Settings size={20} />
        {!!badge && <span style={styles.count}>{badge}</span>}
      </button>
    </div>
  );
}

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
    fontFamily: pickerFont,
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
    maxWidth: "calc(100vw - 40px)",
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
  tabs: {
    display: "flex",
    gap: 2,
    margin: "10px 0 12px",
    padding: 3,
    borderRadius: 10,
    background: "var(--picker-well)",
    border: "1px solid var(--picker-border)",
  },
  tab: {
    flex: 1,
    padding: "6px 8px",
    borderRadius: 8,
    border: "none",
    fontSize: 12.5,
    fontWeight: 500,
    cursor: "pointer",
  },
  body: { overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column" },
};
