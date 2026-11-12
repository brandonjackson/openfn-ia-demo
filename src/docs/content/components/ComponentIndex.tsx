import { useSearchParams } from "react-router-dom";
import catalog, { type CatalogLayer } from "virtual:component-catalog";
import Badge from "../../../components/primitives/Badge";
import EmptyState from "../../../components/primitives/EmptyState";
import Inline from "../../../components/primitives/Inline";
import ListGroup from "../../../components/primitives/ListGroup";
import ListRow from "../../../components/primitives/ListRow";
import SearchInput from "../../../components/primitives/SearchInput";
import SegmentedControl from "../../../components/primitives/SegmentedControl";
import Stack from "../../../components/primitives/Stack";
import Text from "../../../components/primitives/Text";
import { DocPage } from "../../parts/Doc";
import { guides } from "./guide-index";
import { layerInfo } from "./layers";


/** The first sentence of a description, for a row. */
function summary(text: string): string {
  const flat = text.replace(/\s*\n\s*/g, " ").replace(/`/g, "");
  const end = flat.search(/\.(\s|$)/);
  return end > 0 ? flat.slice(0, end + 1) : flat;
}

/** Every component in the library, by layer, searchable. */
export default function ComponentIndex() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const layer = (params.get("layer") ?? "all") as CatalogLayer | "all";
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const q = query.trim().toLowerCase();
  const shown = catalog.filter(
    (c) => (layer === "all" || c.layer === layer) && (!q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
  );
  const layers = (Object.keys(layerInfo) as CatalogLayer[]).filter((l) => layer === "all" || l === layer);

  return (
    <DocPage
      eyebrow="Components"
      title="Components"
      lead="Every component in src/components, read from its source: what it's for, its props and where it's used. The ones marked Guide have examples and usage notes too."
    >
      <Stack gap="lg">
        <Inline stackOnMobile>
          <Stack grow>
            <SearchInput placeholder="Search by name or what it does" value={query} onChange={(e) => set("q", e.target.value)} aria-label="Search components" />
          </Stack>
          <SegmentedControl
            options={[
              { id: "all", label: "All", count: catalog.length },
              ...(Object.keys(layerInfo) as CatalogLayer[]).map((l) => ({
                id: l,
                label: layerInfo[l].title,
                count: catalog.filter((c) => c.layer === l).length,
              })),
            ]}
            value={layer}
            onChange={(v) => set("layer", v)}
          />
        </Inline>
        <Text tone="muted" role="status">
          {shown.length} {shown.length === 1 ? "component" : "components"}
        </Text>
        {shown.length === 0 ? (
          <EmptyState title="No components match." description="Try another word, or search all layers." />
        ) : (
          <Stack gap="xl">
            {layers.map((l) => {
              const rows = shown.filter((c) => c.layer === l);
              if (!rows.length) return null;
              return (
                <ListGroup key={l} title={layerInfo[l].title} count={rows.length} description={layerInfo[l].description}>
                  {rows.map((c) => (
                        <ListRow
                          key={c.name}
                          icon={layerInfo[l].icon}
                          title={c.name}
                          badges={guides[c.name] ? <Badge label="Guide" tone="indigo" shape="tag" /> : undefined}
                          description={summary(c.description) || undefined}
                          to={`/docs/components/${c.name}`}
                        />
                  ))}
                </ListGroup>
              );
            })}
          </Stack>
        )}
      </Stack>
    </DocPage>
  );
}
