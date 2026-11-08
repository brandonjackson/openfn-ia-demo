import { useState } from "react";
import { Check } from "lucide-react";
import type { ThemeId, ThemeMeta } from "../../theme/themes";
import { optionState, pickerStyles as s } from "../primitives/picker-chrome";

interface Props {
  /** Every theme, in the order to list them. */
  themes: ThemeMeta[];
  /** The theme in use. */
  themeId: ThemeId;
  /** Switches the whole app to a theme. */
  onSelect: (id: ThemeId) => void;
}

/**
 * The themes the app can wear, each with a preview of its palette: the Theme
 * section of the demo settings. Picking one re-skins every component without
 * touching its markup. Only the swatches show each theme's real colours; the
 * rest is the theme-independent --picker-* chrome.
 */
export default function ThemeChooser({ themes, themeId, onSelect }: Props) {
  return (
    <div>
      <p style={s.subtitle}>Same components, totally different look &amp; feel.</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {themes.map((theme) => (
          <li key={theme.id}>
            <ThemeRow theme={theme} active={theme.id === themeId} onSelect={() => onSelect(theme.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ThemeRow({ theme, active, onSelect }: { theme: ThemeMeta; active: boolean; onSelect: () => void }) {
  const [hover, setHover] = useState(false);
  const dark = theme.mode === "dark";
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...s.option, ...optionState(active, hover) }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 2,
          flexShrink: 0,
          padding: 3,
          borderRadius: 9,
          background: "var(--picker-well)",
          border: "1px solid var(--picker-border)",
        }}
      >
        {theme.swatches.map((color, i) => (
          <span key={i} style={{ width: 13, height: 13, borderRadius: 3, background: color }} />
        ))}
      </span>
      <span style={s.optionText}>
        <span style={s.optionName}>
          {theme.name}
          <span
            title={dark ? "Dark" : "Light"}
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              border: "1px solid",
              display: "inline-block",
              background: dark ? "var(--picker-dark-dot)" : "var(--picker-border)",
              borderColor: dark ? "var(--picker-dark-dot)" : "var(--picker-light-dot-border)",
            }}
          />
        </span>
        <span style={s.optionDesc}>{theme.description}</span>
      </span>
      <span style={s.check}>{active && <Check size={16} />}</span>
    </button>
  );
}
