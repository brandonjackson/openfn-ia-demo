import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

export interface SettingsTab {
  /** URL hash without the "#", e.g. "webhook_security". */
  hash: string;
  label: string;
  /** Heroicon class, e.g. "hero-key". */
  icon: string;
}

interface Props {
  tabs: SettingsTab[];
  active: string;
  /** Called with the tab's hash; the page writes it to the URL. */
  onSelect?: (hash: string) => void;
}

/**
 * The vertical tab list of Lightning's `Tabbed.container
 * orientation="vertical"` (live/components/tabbed.ex), styled by the
 * `.tabbed-selector` rules in assets/css/app.css: an indigo underline and
 * text on the selected tab, gray otherwise. Each tab links to `#hash` on the
 * current route; `onSelect` lets the page take over the navigation.
 */
export default function SettingsTabs({ tabs, active, onSelect }: Props) {
  return (
    <div role="tablist" className="flex flex-none flex-col space-y-4 pr-8">
      {tabs.map((tab) => {
        const selected = tab.hash === active;
        return (
          <Link
            key={tab.hash}
            id={`${tab.hash}-tab`}
            to={{ hash: tab.hash }}
            role="tab"
            aria-controls={`${tab.hash}-panel`}
            aria-selected={selected}
            onClick={(e) => {
              if (!onSelect) return;
              e.preventDefault();
              onSelect(tab.hash);
            }}
            className={cn(
              "text-sm font-semibold py-2 px-1 border-b-2 leading-tight",
              selected
                ? "border-b-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-600 hover:border-b-gray-300"
            )}
          >
            <span className={cn(tab.icon, "h-5 w-5 inline-block mr-2")} />{" "}
            <span className="inline-block align-middle">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
