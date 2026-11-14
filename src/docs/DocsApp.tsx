import { useEffect, type ComponentType } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import DocsFrame, { type DocsNavGroup } from "./parts/DocsFrame";
import Overview from "./content/Overview";
import Introduction from "./content/Introduction";
import GettingStarted from "./content/GettingStarted";
import CoreConcepts from "./content/CoreConcepts";
import Contributing from "./content/Contributing";
import Colour from "./content/foundations/Colour";
import Typography from "./content/foundations/Typography";
import Layout from "./content/foundations/Layout";
import Icons from "./content/foundations/Icons";
import Content from "./content/foundations/Content";
import Forms from "./content/guidelines/Forms";
import Lists from "./content/guidelines/Lists";
import EmptyAndLoading from "./content/guidelines/EmptyAndLoading";
import Overlays from "./content/guidelines/Overlays";
import Accessibility from "./content/guidelines/Accessibility";
import Notifications from "./content/guidelines/Notifications";
import ComponentIndex from "./content/components/ComponentIndex";
import ComponentPage from "./content/components/ComponentPage";
import EmptyState from "../components/primitives/EmptyState";
import TextLink from "../components/primitives/TextLink";

interface DocsPage {
  path: string;
  title: string;
  page: ComponentType;
}

const groups: { label: string; pages: DocsPage[] }[] = [
  {
    label: "Getting started",
    pages: [
      { path: "", title: "Overview", page: Overview },
      { path: "introduction", title: "Introduction", page: Introduction },
      { path: "getting-started", title: "Getting started", page: GettingStarted },
      { path: "core-concepts", title: "Core concepts", page: CoreConcepts },
      { path: "contributing", title: "Contributing", page: Contributing },
    ],
  },
  {
    label: "Foundations",
    pages: [
      { path: "foundations/colour", title: "Colour", page: Colour },
      { path: "foundations/typography", title: "Typography", page: Typography },
      { path: "foundations/layout", title: "Layout and spacing", page: Layout },
      { path: "foundations/icons", title: "Icons and logos", page: Icons },
      { path: "foundations/content", title: "Content", page: Content },
    ],
  },
  {
    label: "Guidelines",
    pages: [
      { path: "guidelines/forms", title: "Forms", page: Forms },
      { path: "guidelines/lists", title: "Lists", page: Lists },
      { path: "guidelines/empty-and-loading", title: "Empty and loading states", page: EmptyAndLoading },
      { path: "guidelines/menus-and-dialogs", title: "Menus and dialogs", page: Overlays },
      { path: "guidelines/notifications", title: "Notifications", page: Notifications },
      { path: "guidelines/accessibility", title: "Accessibility", page: Accessibility },
    ],
  },
  {
    label: "Components",
    pages: [{ path: "components", title: "All components", page: ComponentIndex }],
  },
];

const nav: DocsNavGroup[] = groups.map((g) => ({
  label: g.label,
  items: g.pages.map((p) => ({ path: p.path ? `/docs/${p.path}` : "/docs", title: p.title })),
}));

/**
 * The design system's docs, at /docs: an introduction for developers, in the
 * spirit of GitHub's Primer docs, built from the library it describes. Lazy
 * loaded by the app, so none of it ships until someone opens it.
 */
export default function DocsApp() {
  const { pathname, hash } = useLocation();

  // Links to a section (/docs/core-concepts#slots) scroll to it once it's drawn.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    el?.scrollIntoView({ block: "start" });
  }, [pathname, hash]);

  useEffect(() => {
    const previous = document.title;
    const page = groups.flatMap((g) => g.pages).find((p) => `/docs/${p.path}`.replace(/\/$/, "") === pathname.replace(/\/$/, ""));
    const component = pathname.match(/^\/docs\/components\/(.+)$/)?.[1];
    document.title = `${component ?? page?.title ?? "Docs"} · OpenFn design system`;
    return () => {
      document.title = previous;
    };
  }, [pathname]);

  return (
    <DocsFrame nav={nav} currentPath={pathname}>
      <Routes>
        {groups.flatMap((g) =>
          g.pages.map(({ path, page: Page }) => (path ? <Route key={path} path={path} element={<Page />} /> : <Route key="index" index element={<Page />} />))
        )}
        <Route path="components/:name" element={<ComponentPage />} />
        <Route
          path="*"
          element={<EmptyState title="There's no docs page here." action={<TextLink to="/docs">Go to the docs</TextLink>} />}
        />
      </Routes>
    </DocsFrame>
  );
}
