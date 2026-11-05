import { useEffect, useRef, useState, type ReactNode } from "react";
import MobileTopBar from "./MobileTopBar";
import PageContainer from "./PageContainer";

/** Whether the sidebar's drawer is showing on small screens, and how it closes. */
export interface SidebarDrawer {
  open: boolean;
  onClose: () => void;
}

interface Props {
  /** The URL being shown. A new one scrolls the page back to the top and closes the drawer. */
  currentPath: string;
  /** The sidebar, drawn with the drawer state the frame keeps for small screens. */
  sidebar: (drawer: SidebarDrawer) => ReactNode;
  /** The logo in the top bar on small screens, where the sidebar is hidden. */
  logo: ReactNode;
  /** The page. */
  children: ReactNode;
}

/**
 * The frame around every page outside the workflow editor: the sidebar (a
 * drawer on small screens), the mobile top bar, and the scrolling column the
 * page sits in. The sidebar and logo are slots, so the frame doesn't know
 * what's in the menu.
 */
export default function Layout({ currentPath: pathname, sidebar, logo, children }: Props) {
  // On small screens the sidebar is a drawer. Remembering the page it was
  // opened on means following a link in it closes it again.
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const menuOpen = menuOpenAt === pathname;

  // The page scrolls inside <main>, not the window, so the browser never
  // resets it. Start every new page at the top.
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex h-dvh">
      {sidebar({ open: menuOpen, onClose: () => setMenuOpenAt(null) })}
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileTopBar onOpenMenu={() => setMenuOpenAt(pathname)} logo={logo} />
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-8">
          <PageContainer>
            {children}
          </PageContainer>
        </main>
      </div>
    </div>
  );
}
