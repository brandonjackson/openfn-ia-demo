import { useParams } from "react-router-dom";
import catalog from "virtual:component-catalog";
import Code from "../../../components/primitives/Code";
import CodeBlock from "../../../components/primitives/CodeBlock";
import EmptyState from "../../../components/primitives/EmptyState";
import Inline from "../../../components/primitives/Inline";
import Text from "../../../components/primitives/Text";
import TextLink from "../../../components/primitives/TextLink";
import { Bullets, DocPage, LayerBadge, P, Section } from "../../parts/Doc";
import InlineMarkdown from "../../parts/InlineMarkdown";
import PropsTable from "../../parts/PropsTable";
import { sourceUrl, storyUrl } from "../../links";
import { guides } from "./guide-index";
import { layerInfo } from "./layers";

const shownUses = 12;

/** One component: its guide when it has one, then its import, props and where it's used. */
export default function ComponentPage() {
  const { name } = useParams();
  const entry = catalog.find((c) => c.name === name);
  if (!entry) {
    return (
      <EmptyState
        title={`There's no component called ${name}.`}
        description="It may have been renamed or removed."
        action={<TextLink to="/docs/components">See every component</TextLink>}
      />
    );
  }
  const Guide = guides[entry.name];
  const siblings = catalog.filter((c) => c.file === entry.file && c.name !== entry.name);

  return (
    <DocPage
      eyebrow={`Components: ${layerInfo[entry.layer].title}`}
      title={entry.name}
      badges={<LayerBadge layer={entry.layer} />}
      lead={entry.description ? <InlineMarkdown text={entry.description} /> : undefined}
      actions={
        <Inline gap="lg" wrap>
          {entry.storyId && <TextLink href={storyUrl(entry.storyId)}>Storybook</TextLink>}
          <TextLink href={sourceUrl(entry.file)}>Source</TextLink>
          <Text tone="subtle" mono size="xs">
            {entry.file}
          </Text>
        </Inline>
      }
    >
      {Guide && <Guide />}

      <Section title="Import">
        <CodeBlock tone="light" code={entry.importLine} />
        {siblings.length > 0 && (
          <P>
            Lives in the same file as{" "}
            {siblings.map((s, i) => (
              <span key={s.name}>
                {i > 0 && ", "}
                <TextLink to={`/docs/components/${s.name}`} variant="inline">
                  {s.name}
                </TextLink>
              </span>
            ))}
            .
          </P>
        )}
      </Section>

      <Section title="Props">
        <PropsTable props={entry.props} />
        {entry.extendsTypes.length > 0 && (
          <Text tone="muted">
            Also takes everything from{" "}
            {entry.extendsTypes.map((t, i) => (
              <span key={t}>
                {i > 0 && ", "}
                <Code>{t}</Code>
              </span>
            ))}
            .
          </Text>
        )}
      </Section>

      <Section title="Where it's used">
        {entry.usedBy.length === 0 ? (
          <Text tone="muted">Nothing imports it yet, besides its stories.</Text>
        ) : (
          <>
            <Text tone="muted">
              Imported by {entry.usedBy.length} {entry.usedBy.length === 1 ? "file" : "files"}.
            </Text>
            <Bullets
              items={[
                ...entry.usedBy.slice(0, shownUses).map((f) => (
                  <TextLink key={f} href={sourceUrl(f)} variant="inline">
                    {f.replace(/^src\//, "")}
                  </TextLink>
                )),
                ...(entry.usedBy.length > shownUses ? [<Text key="more" tone="muted">and {entry.usedBy.length - shownUses} more</Text>] : []),
              ]}
            />
          </>
        )}
      </Section>
    </DocPage>
  );
}
