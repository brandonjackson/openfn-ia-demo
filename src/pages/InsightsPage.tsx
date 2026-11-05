import type { PageProps } from "../model/ia-tree";
import type { InsightsPageData, ProjectInsight } from "../model/page-data";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import Badge from "../components/primitives/Badge";
import Card from "../components/primitives/Card";
import StatTile from "../components/primitives/StatTile";
import BarChart from "../components/primitives/BarChart";
import SectionHeading from "../components/primitives/SectionHeading";
import DataTable from "../components/primitives/DataTable";
import type { DataTableColumn } from "../components/primitives/DataTable";
import TextLink from "../components/primitives/TextLink";

export type InsightsPageProps = PageProps<InsightsPageData>;

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
export default function InsightsPage({ node, ancestors, data }: InsightsPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
        title={node.label}
        description={node.description}
        actions={<Badge label={data.range} />}
      />

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
