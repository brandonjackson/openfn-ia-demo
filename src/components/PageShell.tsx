import { useState } from "react";
import type { IANode } from "../ia-tree";
import Badge from "./Badge";
import Button from "./Button";
import Callout from "./Callout";
import ChildCard from "./ChildCard";
import EmptyState from "./EmptyState";
import PageHeader from "./PageHeader";
import SectionHeading from "./SectionHeading";
import SegmentedControl from "./SegmentedControl";
import TextLink from "./TextLink";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
}

/** Placeholder page for IA nodes that don't have a template yet. */
export default function PageShell({ node, ancestors, currentPath }: Props) {
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
