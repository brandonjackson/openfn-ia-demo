import { useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  ClipboardList,
  Database,
  HeartPulse,
  Landmark,
  LibraryBig,
  Languages,
  ListCollapse,
  MessageSquare,
  PenLine,
  Plug,
  ScanText,
  Search,
  Sparkles,
  Tags,
} from "lucide-react";
import SettingsNav from "../primitives/SettingsNav";
import SectionHeading from "../primitives/SectionHeading";
import EmptyState from "../primitives/EmptyState";
import NavItem from "../primitives/NavItem";
import IconTile from "../primitives/IconTile";
import AdaptorLogo from "./AdaptorLogo";
import type { AdaptorCatalog, AiAction, CatalogGroup } from "../../model/adaptor-catalog";
import SearchInput from "../primitives/SearchInput";
import type { StepService } from "../../model/services";

/** What was picked: an adaptor to connect, an AI action to run on the data, or a published service to call. */
export type ConnectChoice =
  | { kind: "adaptor"; adaptor: string }
  | { kind: "ai"; action: AiAction }
  | { kind: "service"; service: StepService };

const categoryIcons: Record<string, LucideIcon> = {
  health: HeartPulse,
  "data-collection": ClipboardList,
  messaging: MessageSquare,
  government: Landmark,
  business: Briefcase,
  data: Database,
};

const actionIcons: Record<string, LucideIcon> = {
  generate: PenLine,
  summarize: ListCollapse,
  translate: Languages,
  classify: Tags,
  extract: ScanText,
};

/**
 * The picker behind a step's + on the canvas ("Add a step"), and the shape
 * of any "Connect a system" picker: whoever opens it gives it its title, in
 * the `Modal` around it. A side menu of categories sits beside the choices, with a search
 * over the top that looks across all of them.
 *
 * **Connected** (the default) lists the systems this project already talks
 * to, beside the built-in tools that don't need a system of their own.
 * **AI** offers actions on the incoming data (generate, summarize,
 * translate, classify, extract) and the models behind them. **Services**,
 * when it's given them, lists the organisation's Live services a step can
 * call, under who offers each. The rest are every adaptor, sorted by what
 * the system does into titled groups.
 *
 * Given `onConnectNew`, an adaptor this project isn't connected to yet (one
 * picked from a category, AI's models or a search, but not a built-in tool)
 * goes to it instead of `onSelect`, so the system can be added first.
 *
 * With `purpose="system"` (a systems page's "Connect a system") it offers
 * only systems to connect: the categories, and a search over every adaptor
 * but the built-in tools (HTTP aside, for any other API). There's no
 * Connected, AI or Services, which only make sense for a step, and every
 * pick goes to `onSelect`.
 */
export default function ConnectSystemPicker({
  catalog,
  connected,
  services,
  onSelect,
  onConnectNew,
  purpose = "step",
  initialCategory = purpose === "system" ? catalog.categories[0]?.id ?? "" : "connected",
}: {
  /** Every adaptor, sorted into categories, with the built-in tools and what the AI tab offers. */
  catalog: AdaptorCatalog;
  /** Adaptor ids of the systems this project is connected to. */
  connected: string[];
  /** Published services a step can call, each under who offers it. Left out, there's no Services tab and search doesn't look at services. */
  services?: StepService[];
  onSelect?: (choice: ConnectChoice) => void;
  /** Called instead of `onSelect` for an adaptor the project has no system for yet (not connected, not a built-in tool), to add one first. Left out, every adaptor goes to `onSelect`. */
  onConnectNew?: (adaptor: string) => void;
  /** What's being picked: a step to add (the default), or a system to connect, which leaves out what only a step can be. */
  purpose?: "step" | "system";
  initialCategory?: string;
}) {
  const { adaptors: adaptorCatalog, categories: catalogCategories, builtInTools, aiModels, aiActions } = catalog;
  const catalogAdaptor = (id: string) => adaptorCatalog.find((a) => a.id === id);
  const forSystem = purpose === "system";
  const navItems = [
    ...(forSystem
      ? []
      : [
          { id: "connected", label: "Connected", icon: Plug },
          { id: "ai", label: "AI", icon: Sparkles },
          ...(services ? [{ id: "services", label: "Services", icon: LibraryBig }] : []),
        ]),
    ...catalogCategories.map((c) => ({ id: c.id, label: c.label, icon: categoryIcons[c.id] ?? Plug })),
  ];
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const pickAdaptor = (adaptor: string) =>
    !forSystem &&
    onConnectNew && !connected.includes(adaptor) && !builtInTools.includes(adaptor)
      ? onConnectNew(adaptor)
      : onSelect?.({ kind: "adaptor", adaptor });

  const adaptorRows = (ids: string[]) =>
    ids.map((id) => {
      const a = catalogAdaptor(id);
      if (!a) return null;
      return (
        <NavItem
          variant="tree"
          key={id}
          leading={<AdaptorLogo adaptor={id} name={a.name} size="sm" />}
          label={a.name}
          description={a.description}
          onClick={() => pickAdaptor(id)}
        />
      );
    });

  const actionRows = (actions: AiAction[]) =>
    actions.map((action) => {
      const Icon = actionIcons[action.id] ?? Sparkles;
      return (
        <NavItem
          variant="tree"
          key={action.id}
          leading={<IconTile icon={Icon} size="sm" tone="white" />}
          label={action.label}
          description={action.description}
          onClick={() => onSelect?.({ kind: "ai", action })}
        />
      );
    });

  const serviceRows = (list: StepService[]) =>
    list.map((service) => (
      <NavItem
        variant="tree"
        key={service.id}
        leading={<IconTile icon={LibraryBig} size="sm" tone="white" />}
        label={service.name}
        description={service.description}
        onClick={() => onSelect?.({ kind: "service", service })}
      />
    ));

  const columns = (content: ReactNode) => <div className="grid grid-cols-2 gap-x-6 gap-y-5">{content}</div>;

  const group = (title: string, rows: ReactNode) => (
    <section key={title} className="min-w-0">
      <SectionHeading title={title} variant="label" compact />
      <div className="-mx-2 space-y-0.5">{rows}</div>
    </section>
  );

  const groups = (list: CatalogGroup[]) => list.map((g) => group(g.label, adaptorRows(g.adaptors)));

  let body: ReactNode;
  if (q) {
    const actions = forSystem ? [] : aiActions.filter((a) => `${a.label} ${a.description}`.toLowerCase().includes(q));
    const matchedServices = forSystem ? [] : (services ?? []).filter((s) => `${s.name} ${s.description} ${s.offeredBy}`.toLowerCase().includes(q));
    const adaptors = adaptorCatalog
      .filter((a) => !forSystem || a.id === "http" || !builtInTools.includes(a.id))
      .filter((a) => `${a.name} ${a.description} ${a.id}`.toLowerCase().includes(q))
      .map((a) => a.id);
    body =
      actions.length + matchedServices.length + adaptors.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches"
          description={`Nothing called "${query.trim()}". Try the system's name, or HTTP to call any API.`}
        />
      ) : (
        <div className="space-y-5">
          {actions.length > 0 && group("AI", actionRows(actions))}
          {matchedServices.length > 0 && group("Services", serviceRows(matchedServices))}
          {adaptors.length > 0 && group(forSystem ? "Systems" : "Adaptors", <div className="grid grid-cols-2 gap-x-4">{adaptorRows(adaptors)}</div>)}
        </div>
      );
  } else if (category === "connected") {
    body = columns(
      <>
        {group(
          "Connected to this project",
          connected.length ? adaptorRows(connected) : <p className="px-2 text-sm text-gray-500">No systems connected yet.</p>
        )}
        {group("Built-in tools", adaptorRows(builtInTools))}
      </>
    );
  } else if (category === "ai") {
    body = columns(
      <>
        {group("Ask AI to", actionRows(aiActions))}
        {group("Models", adaptorRows(aiModels))}
      </>
    );
  } else if (category === "services" && services) {
    const offeredBy = [...new Set(services.map((s) => s.offeredBy))].sort((a, b) => a.localeCompare(b));
    body = services.length ? (
      columns(offeredBy.map((by) => group(by, serviceRows(services.filter((s) => s.offeredBy === by)))))
    ) : (
      <EmptyState
        icon={LibraryBig}
        title="No services to call yet"
        description="Live services published from your organization's projects show up here, ready to call from a step."
      />
    );
  } else {
    const found = catalogCategories.find((c) => c.id === category);
    body = columns(found && groups(found.groups));
  }

  return (
    <div className="flex h-[min(520px,60vh)] flex-col gap-4">
      <SearchInput
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          forSystem
            ? "Search systems (e.g. DHIS2, Salesforce, PostgreSQL)..."
            : services
              ? `Search ${adaptorCatalog.length} systems, tools and services...`
              : `Search ${adaptorCatalog.length} systems and tools...`
        }
        aria-label={forSystem ? "Search systems" : services ? "Search systems, tools and services" : "Search systems and tools"}
      />
      <div className="flex min-h-0 flex-1 gap-4">
        <SettingsNav
          items={navItems}
          activeId={q ? "" : category}
          onSelect={(id) => {
            setCategory(id);
            setQuery("");
          }}
          ariaLabel="Categories"
        />
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto border-l border-gray-100 pl-5">{body}</div>
      </div>
    </div>
  );
}
