import { useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  ClipboardList,
  Database,
  HeartPulse,
  Landmark,
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
import SettingsNav from "../SettingsNav";
import SectionHeading from "../SectionHeading";
import EmptyState from "../EmptyState";
import { TextInput } from "../FormControls";
import ConnectOptionRow from "./ConnectOptionRow";
import {
  adaptorCatalog,
  aiActions,
  aiModels,
  builtInTools,
  catalogAdaptor,
  catalogCategories,
} from "../../mock-data/adaptor-catalog";
import type { AiAction, CatalogGroup } from "../../mock-data/adaptor-catalog";

/** What was picked: an adaptor to connect, or an AI action to run on the data. */
export type ConnectChoice = { kind: "adaptor"; adaptor: string } | { kind: "ai"; action: AiAction };

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

const navItems = [
  { id: "connected", label: "Connected", icon: Plug },
  { id: "ai", label: "AI", icon: Sparkles },
  ...catalogCategories.map((c) => ({ id: c.id, label: c.label, icon: categoryIcons[c.id] ?? Plug })),
];

/**
 * The picker behind a step's + on the canvas: connect the next step to a
 * system. A side menu of categories sits beside the choices, with a search
 * over the top that looks across all of them.
 *
 * **Connected** (the default) lists the systems this project already talks
 * to, beside the built-in tools that don't need a system of their own.
 * **AI** offers actions on the incoming data (generate, summarize,
 * translate, classify, extract) and the models behind them. The rest are
 * every adaptor, sorted by what the system does into titled groups.
 */
export default function ConnectSystemPicker({
  connected,
  onSelect,
  initialCategory = "connected",
}: {
  /** Adaptor ids of the systems this project is connected to. */
  connected: string[];
  onSelect?: (choice: ConnectChoice) => void;
  initialCategory?: string;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const pickAdaptor = (adaptor: string) => onSelect?.({ kind: "adaptor", adaptor });

  const adaptorRows = (ids: string[]) =>
    ids.map((id) => {
      const a = catalogAdaptor(id);
      if (!a) return null;
      return <ConnectOptionRow key={id} adaptor={id} name={a.name} description={a.description} onSelect={() => pickAdaptor(id)} />;
    });

  const actionRows = (actions: AiAction[]) =>
    actions.map((action) => {
      const Icon = actionIcons[action.id] ?? Sparkles;
      return (
        <ConnectOptionRow
          key={action.id}
          icon={<Icon size={16} />}
          name={action.label}
          description={action.description}
          onSelect={() => onSelect?.({ kind: "ai", action })}
        />
      );
    });

  const group = (title: string, rows: ReactNode) => (
    <section key={title} className="min-w-0">
      <SectionHeading title={title} variant="label" compact />
      <div className="-mx-2 space-y-0.5">{rows}</div>
    </section>
  );

  const groups = (list: CatalogGroup[]) => list.map((g) => group(g.label, adaptorRows(g.adaptors)));

  let body: ReactNode;
  if (q) {
    const actions = aiActions.filter((a) => `${a.label} ${a.description}`.toLowerCase().includes(q));
    const adaptors = adaptorCatalog
      .filter((a) => `${a.name} ${a.description} ${a.id}`.toLowerCase().includes(q))
      .map((a) => a.id);
    body =
      actions.length + adaptors.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches"
          description={`Nothing called "${query.trim()}". Try the system's name, or HTTP to call any API.`}
        />
      ) : (
        <div className="space-y-5">
          {actions.length > 0 && group("AI", actionRows(actions))}
          {adaptors.length > 0 && group("Adaptors", <div className="grid grid-cols-2 gap-x-4">{adaptorRows(adaptors)}</div>)}
        </div>
      );
  } else if (category === "connected") {
    body = (
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {group(
          "Connected to this project",
          connected.length ? adaptorRows(connected) : <p className="px-2 text-sm text-gray-500">No systems connected yet.</p>
        )}
        {group("Built-in tools", adaptorRows(builtInTools))}
      </div>
    );
  } else if (category === "ai") {
    body = (
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {group("Ask AI to", actionRows(aiActions))}
        {group("Models", adaptorRows(aiModels))}
      </div>
    );
  } else {
    const found = catalogCategories.find((c) => c.id === category);
    body = <div className="grid grid-cols-2 gap-x-6 gap-y-5">{found && groups(found.groups)}</div>;
  }

  return (
    <div className="flex h-[min(520px,60vh)] flex-col gap-4">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <TextInput
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${adaptorCatalog.length} systems and tools...`}
          aria-label="Search systems and tools"
          className="pl-9"
        />
      </div>
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
