import type { IANode } from "../ia-tree";
import type { InsightsPageData, ProjectInsight } from "../page-data";
import Breadcrumbs from "../components/Breadcrumbs";
import Badge from "../components/Badge";
import Card from "../components/Card";
import StatTile from "../components/StatTile";
import BarChart from "../components/BarChart";
import SectionHeading from "../components/SectionHeading";
import DataTable from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import TextLink from "../components/TextLink";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: InsightsPageData;
}

const projectColumns: DataTableColumn<ProjectInsight>[] = [
  {
    key: "name",
    header: "Project",
    render: (p) => (
      <span className="block max-w-80 truncate" title={p.name}>
        <TextLink to={`/projects/${p.id}`}>{p.name}</TextLink>
      </span>
    ),
  },
  { key: "runs", header: "Runs", align: "right", render: (p) => p.runs.toLocaleString("en-US") },
  { key: "failed", header: "Errors", align: "right", render: (p) => p.failed },
  {
    key: "rate",
    header: "Error rate",
    align: "right",
    render: (p) => `${((p.failed / p.runs) * 100).toFixed(1)}%`,
  },
  { key: "avg", header: "Avg run time", align: "right", render: (p) => p.avgDuration },
];

/**
 * Monitoring, over time: headline numbers, daily runs and errors, and a
 * per-project breakdown (left out inside a single project). Runs and errors
 * are on very different scales, so they get a chart each rather than sharing
 * one.
 */
export default function InsightsTemplate({ node, ancestors, data }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <Breadcrumbs
          ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
          current={node.label}
        />
        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
            <p className="mt-1 text-sm text-gray-500">{node.description}</p>
          </div>
          <Badge label={data.range} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.tiles.map((tile) => (
          <StatTile
            key={tile.label}
            {...tile}
            trendClassName={tile.label === "Errors" ? "text-red-500" : undefined}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Runs per day" description="Every run, successful or not.">
          <BarChart
            unit="runs"
            data={data.daily.map((d) => ({ label: d.day, value: d.succeeded + d.failed }))}
          />
        </Card>
        <Card title="Errors per day" description="Runs that ended in failure.">
          <BarChart
            unit="errors"
            barClassName="bg-red-500"
            data={data.daily.map((d) => ({ label: d.day, value: d.failed }))}
          />
        </Card>
      </div>

      {data.projects.length > 0 && (
        <section>
          <SectionHeading title="By project" description={`${data.range}, busiest first.`} />
          <DataTable
            columns={projectColumns}
            rows={[...data.projects].sort((a, b) => b.runs - a.runs)}
            getRowKey={(p) => p.id}
          />
        </section>
      )}
    </div>
  );
}
