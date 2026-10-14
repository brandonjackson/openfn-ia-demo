import type { ReactNode } from "react";
import Header from "../Header";
import { Centered, PageContent } from "../PageContent";
import { OpenFnLogoCollapsed } from "../OpenFnLogo";

/** The dark top bar with the boxed Fn logo (Lightning's `LayoutComponents.nav`). */
export function AuthNav() {
  return (
    <nav className="bg-secondary-800" data-ui="auth-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <OpenFnLogoCollapsed className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * Lightning's logged-out page frame (layouts/app.html.heex plus the
 * controller templates): the nav bar, a white header band with a large bold
 * title, then the gray content area with a centred column. No side menu.
 */
export default function AuthLayout({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <main className="h-screen">
      <div className="flex flex-col h-full">
        <AuthNav />
        <PageContent header={<Header title={title} loggedOut />}>
          <Centered>{children}</Centered>
        </PageContent>
      </div>
    </main>
  );
}
