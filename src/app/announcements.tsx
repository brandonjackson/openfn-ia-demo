import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { ToastStack } from "../components/primitives/Toast";
import type { ToastItem } from "../components/primitives/Toast";
import { AnnounceContext } from "./announce";
import type { Announce } from "./announce";

let next = 0;

/**
 * Holds the app's toasts and draws them in a `ToastStack`. It wraps the whole
 * app once (`main.tsx`); wrappers and the shell say what an action did with
 * `useAnnounce` or `useAnnounceOutcome` (`./announce.ts`), and pages, which
 * only draw, never call them.
 */
export function AnnouncementsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const announce = useCallback<Announce>((a) => {
    next += 1;
    // The same message twice in a row replaces the first rather than stacking.
    setToasts((ts) => [...ts.filter((t) => t.message !== a.message), { id: `toast-${next}`, ...a }].slice(-4));
  }, []);
  const dismiss = useCallback((id: string) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);

  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </AnnounceContext.Provider>
  );
}
