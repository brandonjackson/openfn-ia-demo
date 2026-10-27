import { useState } from "react";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FeatureIntroItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Props {
  title: string;
  description?: string;
  features: FeatureIntroItem[];
  /**
   * When set, dismissal is remembered in localStorage under this key so the
   * intro stays closed on later visits.
   */
  storageKey?: string;
  onDismiss?: () => void;
}

function readDismissed(storageKey?: string) {
  if (!storageKey) return false;
  try {
    return window.localStorage.getItem(storageKey) === "dismissed";
  } catch {
    return false;
  }
}

/**
 * Dismissible banner at the top of a page that explains what a feature is
 * for, with a short row of benefits. Close it with the X.
 */
export default function FeatureIntro({ title, description, features, storageKey, onDismiss }: Props) {
  const [dismissed, setDismissed] = useState(() => readDismissed(storageKey));

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, "dismissed");
      } catch {
        /* localStorage may be unavailable (private mode) — ignore. */
      }
    }
    onDismiss?.();
  };

  return (
    <section
      data-ui="feature-intro"
      aria-label={title}
      className="relative rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-white px-5 py-4"
    >
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-600"
      >
        <X size={16} />
      </button>

      <div className="pr-8">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title: featureTitle, description: featureDescription }) => (
          <li key={featureTitle} className="flex items-start gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-violet-100 text-violet-600">
              <Icon size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{featureTitle}</p>
              <p className="mt-0.5 text-xs text-gray-500">{featureDescription}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
