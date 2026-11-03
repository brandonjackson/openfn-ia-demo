import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MobileTopBar from "./MobileTopBar";
import PageContainer from "./PageContainer";
import Sidebar from "./Sidebar";

export default function Layout() {
  const { pathname } = useLocation();
  // On small screens the sidebar is a drawer. Remembering the page it was
  // opened on means following a link in it closes it again.
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const menuOpen = menuOpenAt === pathname;

  return (
    <div className="flex h-dvh">
      <Sidebar open={menuOpen} onClose={() => setMenuOpenAt(null)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileTopBar onOpenMenu={() => setMenuOpenAt(pathname)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </div>
  );
}
