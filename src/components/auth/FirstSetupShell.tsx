import type { ReactNode } from "react";
import { OpenFnLogo } from "../OpenFnLogo";
import { releaseLabel } from "../../mock-data/users";

/**
 * The logged-in live layout as it renders during first setup
 * (layouts/live.html.heex with `is_first_setup`): the side menu is there but
 * empty (no user menu, no items, no project picker), just the footer logo.
 */
export default function FirstSetupShell({ children }: { children: ReactNode }) {
  return (
    <main className="h-screen">
      <div className="flex flex-row h-full">
        <div className="flex-shrink-0 w-48" />
        <div id="sidebar-panel" data-ui="sidebar" className="flex flex-col h-full z-[100] fixed w-48 primary-theme">
          <div className="app-logo-container h-20 flex items-center primary-theme" />
          <nav id="side-menu" className="flex-1 overflow-hidden primary-theme">
            <div className="flex flex-col h-full">
              <div className="flex-1 py-4 overflow-y-auto min-h-0 flex flex-col" />
              <div className="flex-shrink-0 flex flex-col border-t border-white/10 pt-3 mt-3">
                <div className="h-14 text-center">
                  <div className="pt-2">
                    <OpenFnLogo className="h-6 primary-light mx-auto" />
                  </div>
                  <div className="text-[8px] primary-light opacity-50 flex justify-center">
                    <code className="py-1 rounded-md break-keep primary-light inline-block align-middle text-center">
                      {releaseLabel}
                    </code>
                  </div>
                </div>
                <div className="border-t border-white/10 mt-2 h-8" />
              </div>
            </div>
          </nav>
        </div>
        <div className="flex-auto min-w-0">{children}</div>
      </div>
    </main>
  );
}
