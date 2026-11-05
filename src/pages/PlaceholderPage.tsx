import { useState } from "react";
import type { PageProps } from "../model/ia-tree";
import Badge from "../components/primitives/Badge";
import Button from "../components/primitives/Button";
import Callout from "../components/primitives/Callout";
import ChildCard from "../components/domain/ChildCard";
import EmptyState from "../components/primitives/EmptyState";
import PageHeader from "../components/patterns/PageHeader";
import SectionHeading from "../components/primitives/SectionHeading";
import SegmentedControl from "../components/primitives/SegmentedControl";
import TextLink from "../components/primitives/TextLink";

export type PlaceholderPageProps = Omit<PageProps<never>, "data">;

/** Placeholder page for IA nodes that don't have a page of their own yet. */
export default function PlaceholderPage({ node, ancestors, currentPath }: PlaceholderPageProps) {
  const [filterState, setFilterState] = useState<Record<string, string>>(() =>
    Object.fromEntries((node.filters ?? []).map((f) => [f.label, f.options[0]]))
  );

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={{
          ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
          current: node.label,
        }}
        title={node.label}
        badges={node.badges?.map((b) => <Badge key={b} label={b} />)}
        actions={
          node.actions &&
          node.actions.length > 0 &&
          node.actions.map((action) => (
            <Button key={action} variant="secondary" size="sm">
              {action}
            </Button>
          ))
        }
      />

      <div className="space-y-4">
        {node.linkedFrom && (
          <Callout variant="info" title="Also accessible from another page">
            <TextLink to={node.linkedFrom} variant="inline">
              {node.linkedFrom}
            </TextLink>
          </Callout>
        )}

        {node.filters && node.filters.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {node.filters.map((filter) => (
              <SegmentedControl
                key={filter.label}
                label={filter.label}
                options={filter.options}
                value={filterState[filter.label]}
                onChange={(v) => setFilterState((prev) => ({ ...prev, [filter.label]: v }))}
              />
            ))}
          </div>
        )}

        <EmptyState title={node.description || `Content for "${node.label}" goes here.`} />
      </div>

      {node.children && node.children.length > 0 && (
        <section>
          <SectionHeading title="Sub-pages" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {node.children.map((child) => (
              <ChildCard key={child.id} node={child} basePath={currentPath} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
