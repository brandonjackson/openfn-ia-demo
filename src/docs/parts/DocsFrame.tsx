import { useEffect, useRef, useState, type ReactNode } from "react";
import { Layers, Menu, X } from "lucide-react";
import IconButton from "../../components/primitives/IconButton";
import IconTile from "../../components/primitives/IconTile";
import Inline from "../../components/primitives/Inline";
import Link from "../../components/primitives/Link";
import NavItem from "../../components/primitives/NavItem";
import NavSection from "../../components/primitives/NavSection";
import Stack from "../../components/primitives/Stack";
import Text from "../../components/primitives/Text";
import TextLink from "../../components/primitives/TextLink";
import { storybookUrl } from "../links";

export interface DocsNavGroup {
  label: string;
  items: { path: string; title: string }[];
}

interface Props {
  /** The docs' menu, in groups. */
  nav: DocsNavGroup[];
  /** The path being shown, to mark it in the menu, scroll to the top and close the drawer. */
  currentPath: string;
  children: ReactNode;
}

/**
 * The docs' own chrome: a top bar, the menu down the left (a drawer on a
 * phone) and a readable column for the page. It's the one part of the docs
 * that styles itself; every page inside is built from the library alone.
 */
export default function DocsFrame({ nav, currentPath, children }: Props) {
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const menuOpen = menuOpenAt === currentPath;
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [currentPath]);

  const isActive = (path: string) =>
    path === "/docs" ? currentPath === "/docs" || currentPath === "/docs/" : currentPath === path || currentPath.startsWith(`${path}/`);

  const menu = (
    <nav aria-label="Design system docs">
      <Stack gap="lg">
        {nav.map((group) => (
          <NavSection key={group.label} label={group.label}>
            {group.items.map((item) => (
              <NavItem key={item.path} variant="section" label={item.title} to={item.path} active={isActive(item.path)} />
            ))}
          </NavSection>
        ))}
      </Stack>
    </nav>
  );

  return (
    <div className="flex h-dvh flex-col bg-white">
      <header className="flex h-14 flex-none items-center justify-between gap-4 border-b border-gray-200 px-4 md:px-6">
        <Inline gap="sm">
          <span className="md:hidden">
            <IconButton icon={menuOpen ? X : Menu} label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpenAt(menuOpen ? null : currentPath)} />
          </span>
          <Link to="/docs" className="flex items-center gap-2.5">
            <IconTile icon={Layers} size="sm" tone="indigo" />
            <span className="whitespace-nowrap">
              <Text tone="strong">OpenFn design system</Text>
            </span>
          </Link>
        </Inline>
        <Inline gap="lg">
          <span className="hidden sm:inline">
            <TextLink href={storybookUrl}>Storybook</TextLink>
          </span>
          <span className="whitespace-nowrap">
            <TextLink to="/">
              <span className="hidden sm:inline">Back to the app</span>
              <span className="sm:hidden">App</span>
            </TextLink>
          </span>
        </Inline>
      </header>
      <div className="relative flex min-h-0 flex-1">
        <aside
          className={`${menuOpen ? "absolute inset-0 z-20 block bg-white" : "hidden"} w-full flex-none overflow-y-auto border-r border-gray-200 px-3 py-6 md:static md:block md:w-64`}
        >
          {menu}
        </aside>
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto px-4 py-8 md:px-10 md:py-10">
          <div className="mx-auto w-full max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
