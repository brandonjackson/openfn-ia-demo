import type { CSSProperties } from "react";

/*
 * The demo settings' own chrome (`FloatingSettings` and the sections in it):
 * the demo's controls, not part of the product, so they read the same in
 * every theme. Their colours are the --picker-* tokens in theme.css, which no
 * theme redefines (Tailwind utilities would themselves be re-skinned).
 */

export const pickerFont = '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const pickerStyles: Record<
  "subtitle" | "groupLabel" | "button" | "option" | "optionText" | "optionName" | "optionDesc" | "check",
  CSSProperties
> = {
  subtitle: { margin: "2px 0 12px", fontSize: 12, lineHeight: 1.45, color: "var(--picker-muted)" },
  groupLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--picker-muted)",
    margin: "0 0 4px 2px",
  },
  /** A full-width secondary action: copy a link, reset the data. */
  button: {
    width: "100%",
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
  /** One of a set of choices (a theme, a data source); pair with `optionState`. */
  option: {
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
  optionText: { display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 },
  optionName: { display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: "var(--picker-fg)" },
  optionDesc: { fontSize: 11.5, color: "var(--picker-muted)", lineHeight: 1.35 },
  check: { color: "var(--picker-accent)", display: "flex", flexShrink: 0, width: 16 },
};

/** An option's background and border: picked, hovered or neither. */
export const optionState = (active: boolean, hover: boolean): CSSProperties => ({
  background: active ? "var(--picker-accent-soft)" : hover ? "var(--picker-hover)" : "transparent",
  borderColor: active ? "var(--picker-accent)" : "transparent",
});
