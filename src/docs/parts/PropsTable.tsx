import type { CatalogProp } from "virtual:component-catalog";
import Badge from "../../components/primitives/Badge";
import Code from "../../components/primitives/Code";
import DataTable from "../../components/primitives/DataTable";
import Stack from "../../components/primitives/Stack";
import Text from "../../components/primitives/Text";
import InlineMarkdown from "./InlineMarkdown";

/** A component's props, read from its source: name, type, default and the comment over each. */
export default function PropsTable({ props }: { props: CatalogProp[] }) {
  return (
    <DataTable
      rows={props}
      getRowKey={(p) => p.name}
      emptyMessage="This component takes no props."
      columns={[
        {
          key: "name",
          header: "Prop",
          render: (p) => (
            <Stack gap="xs">
              <Code>{p.name}</Code>
              {!p.optional && <Badge label="Required" tone="red" shape="tag" />}
            </Stack>
          ),
        },
        {
          key: "type",
          header: "Type",
          render: (p) => (
            <Stack gap="xs">
              <Text mono size="xs">
                {p.type}
              </Text>
              {p.defaultValue !== undefined && (
                <Text tone="muted" size="xs">
                  Default <Code>{p.defaultValue}</Code>
                </Text>
              )}
            </Stack>
          ),
        },
        {
          key: "description",
          header: "Description",
          render: (p) =>
            p.description ? (
              <Text>
                <InlineMarkdown text={p.description} />
              </Text>
            ) : (
              <Text tone="subtle">—</Text>
            ),
        },
      ]}
    />
  );
}
