import type { ReactNode } from "react";
import { OpenFnLogo } from "../shell/OpenFnLogo";
import { releaseLabel } from "../../mock-data/users";

/**
 * The logged-in live layout as it renders during first setup
 * (layouts/live.html.heex with `is_first_setup`): the side menu is there but
 * empty (no user menu, no items, no project picker), just the footer logo.
 */
export default function FirstSetupShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex h-screen">
      <div className="w-48 shrink-0" />
      <div id="sidebar-panel" data-ui="sidebar" className="primary-theme fixed z-[100] flex h-full w-48 flex-col">
        <div className="app-logo-container primary-theme h-20" />
        <nav id="side-menu" className="primary-theme flex flex-1 flex-col justify-end overflow-hidden">
          <div className="mt-3 border-t border-white/10 pt-5 text-center">
            <OpenFnLogo className="primary-light mx-auto h-6" />
            <code className="primary-light block py-1 text-[8px] opacity-50">{releaseLabel}</code>
          </div>
          <div className="mt-2 h-8 border-t border-white/10" />
        </nav>
      </div>
      <div className="min-w-0 flex-auto">{children}</div>
    </main>
  );
}
