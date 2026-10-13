import { Workflow } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { CatalogEntry, CatalogPageData } from "../page-data";
import Badge from "../components/Badge";
import ChannelRow from "../components/ChannelRow";
import ListRow from "../components/ListRow";
import PageHeader from "../components/PageHeader";
import SectionHeading from "../components/SectionHeading";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: CatalogPageData;
}

function CatalogRow({ entry }: { entry: CatalogEntry }) {
  if (entry.kind === "channel") {
    return (
      <ChannelRow
        id={entry.id}
        name={entry.name}
        description={entry.description}
        channelType={entry.channelType}
        system={{ name: entry.system, path: entry.systemPath }}
      />
    );
  }
  return (
    <ListRow
      to={entry.projectPath}
      icon={Workflow}
      title={entry.name}
      badges={entry.badges?.map((b) => <Badge key={b} label={b} />)}
      description={entry.description}
      meta={entry.project}
    />
  );
}

export default function CatalogTemplate({ node, ancestors, data }: Props) {
  const bySection = new Map<string, CatalogEntry[]>();
  for (const entry of data.entries) {
    const list = bySection.get(entry.section) ?? [];
    list.push(entry);
    bySection.set(entry.section, list);
  }

  return (
    <div className="space-y-8">
      <div>
        <PageHeader
          breadcrumbs={{
            ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
            current: node.label,
          }}
          title={node.label}
          description={node.description}
        />
        <p className="mt-4 text-xs text-gray-400">
          {data.entries.length} services published across the organization
        </p>
      </div>

      {[...bySection.entries()].map(([section, entries]) => (
        <section key={section}>
          <SectionHeading title={section} variant="label" />
          <div className="space-y-2">
            {entries.map((entry) => (
              <CatalogRow key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
