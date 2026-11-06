import type { CollectionItem, ProjectCollection } from "../../model/collections";
import Modal from "../primitives/Modal";
import CodeBlock from "../primitives/CodeBlock";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import TextLink from "../primitives/TextLink";

interface Props {
  /** The collection being previewed; the modal shows while there is one. */
  collection?: ProjectCollection;
  /** Its first few keys, or `undefined` while they load. */
  items?: CollectionItem[];
  onClose: () => void;
}

/** The first few keys of a collection, with their values, as a quick look inside. */
export default function CollectionPreviewModal({ collection, items, onClose }: Props) {
  if (!collection) return null;
  return (
    <Modal open title={`Collection preview: ${collection.name}`} onClose={onClose} widthClass="max-w-3xl">
      <Stack gap="md">
        <Text tone="muted" size="xs" block>
          {items && items.length > 0
            ? `Showing the first ${items.length} of ${collection.itemCount.toLocaleString("en-GB")} keys. `
            : ""}
          We recommend{" "}
          <TextLink variant="inline" href="https://docs.openfn.org/documentation/collections-cli">
            using the CLI
          </TextLink>{" "}
          to manage collections.
        </Text>
        {items === undefined ? (
          <Text tone="muted">Loading…</Text>
        ) : items.length === 0 ? (
          <Text tone="muted">This collection is empty.</Text>
        ) : (
          items.map((item) => (
            <Stack key={item.key} gap="xs">
              <Inline justify="between" gap="md">
                <Text tone="strong" mono truncate>
                  {item.key}
                </Text>
                <Text tone="subtle" size="xs">
                  Updated {item.updatedAt}
                </Text>
              </Inline>
              <CodeBlock code={item.value} tone="light" />
            </Stack>
          ))
        )}
      </Stack>
    </Modal>
  );
}
