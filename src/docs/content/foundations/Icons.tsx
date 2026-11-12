import {
  Bell,
  Clock,
  Copy,
  Database,
  Download,
  Globe,
  KeyRound,
  MoreVertical,
  Play,
  Plus,
  Search,
  Settings,
  Trash2,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import Button from "../../../components/primitives/Button";
import Code from "../../../components/primitives/Code";
import Grid from "../../../components/primitives/Grid";
import IconButton from "../../../components/primitives/IconButton";
import IconTile from "../../../components/primitives/IconTile";
import Stack from "../../../components/primitives/Stack";
import Text from "../../../components/primitives/Text";
import TextLink from "../../../components/primitives/TextLink";
import AdaptorLogo from "../../../components/domain/AdaptorLogo";
import EntityPill from "../../../components/domain/EntityPill";
import { triggerTypes } from "../../../model/workflow";
import { Bullets, DocPage, P, Section } from "../../parts/Doc";
import { DoDont, Example } from "../../parts/Example";

const common: { icon: LucideIcon; name: string; means: string }[] = [
  { icon: Plus, name: "Plus", means: "Add or create" },
  { icon: Workflow, name: "Workflow", means: "A workflow" },
  { icon: Play, name: "Play", means: "Run" },
  { icon: KeyRound, name: "KeyRound", means: "A credential" },
  { icon: Database, name: "Database", means: "A collection" },
  { icon: Globe, name: "Globe", means: "A system we can't place" },
  { icon: Settings, name: "Settings", means: "Settings" },
  { icon: Search, name: "Search", means: "Search" },
  { icon: Copy, name: "Copy", means: "Copy to the clipboard" },
  { icon: Download, name: "Download", means: "Download" },
  { icon: Trash2, name: "Trash2", means: "Delete" },
  { icon: MoreVertical, name: "MoreVertical", means: "More actions (⋮)" },
  { icon: X, name: "X", means: "Close" },
  { icon: Clock, name: "Clock", means: "A schedule" },
  { icon: Bell, name: "Bell", means: "Notifications" },
];

/** Lucide icons, where they go, and the logos of the systems we connect. */
export default function Icons() {
  return (
    <DocPage
      eyebrow="Foundations"
      title="Icons and logos"
      lead="Icons are Lucide (lucide-react): simple line icons that help people scan. They support a label; they rarely replace one."
    >
      <Section title="The icons we use">
        <P>Use the same icon for the same thing everywhere. These are the ones that already mean something in OpenFn.</P>
        <Grid columns={5} gap="sm">
          {common.map(({ icon, name, means }) => (
            <Stack key={name} gap="xs">
              <IconTile icon={icon} />
              <Text size="xs" mono>
                {name}
              </Text>
              <Text size="xs" tone="muted">
                {means}
              </Text>
            </Stack>
          ))}
        </Grid>
        <P>
          Trigger kinds have their icons and labels in <Code>triggerTypes</Code> (<Code>src/model/workflow.ts</Code>); draw
          them from there rather than picking your own:
        </P>
        <Example>
          {Object.entries(triggerTypes).map(([id, t]) => (
            <EntityPill key={id} name={t.label} icon={<t.icon size={14} />} size="sm" />
          ))}
        </Example>
      </Section>

      <Section title="Where icons go">
        <P>Components take an icon as a prop and size and colour it themselves.</P>
        <Example
          code={`<Button icon={Plus}>New workflow</Button>
<IconButton icon={X} label="Close panel" />
<IconButton icon={MoreVertical} label="More actions" />
<IconTile icon={Workflow} tone="indigo" />`}
        >
          <Button icon={Plus}>New workflow</Button>
          <IconButton icon={X} label="Close panel" />
          <IconButton icon={MoreVertical} label="More actions" />
          <IconTile icon={Workflow} tone="indigo" />
        </Example>
        <Bullets
          items={[
            <><Code>Button</Code>'s <Code>icon</Code> leads its label.</>,
            <><Code>IconButton</Code> is every icon-only button, and its <Code>label</Code> is required: it's the accessible name and the tooltip.</>,
            <><Code>IconTile</Code> puts a glyph or logo on a rounded square at the start of a row or card.</>,
          ]}
        />
      </Section>

      <Section title="Systems and adaptors">
        <P>
          The systems OpenFn connects are drawn with{" "}
          <TextLink to="/docs/components/AdaptorLogo" variant="inline">AdaptorLogo</TextLink>: the system's logo, its letters
          when there's no logo, or a globe when we can't place it. Add an adaptor's logo to{" "}
          <Code>src/assets/adaptors/</Code> and its entry to <Code>src/fixtures/adaptor-catalog.ts</Code>.
        </P>
        <Example code={`<AdaptorLogo adaptor="dhis2" />
<EntityPill name="DHIS2" adaptor="dhis2" />
<EntityPill name="Salesforce" adaptor="salesforce" />`}>
          <AdaptorLogo adaptor="dhis2" />
          <AdaptorLogo adaptor="salesforce" />
          <AdaptorLogo adaptor="http" />
          <EntityPill name="DHIS2" adaptor="dhis2" />
          <EntityPill name="Salesforce" adaptor="salesforce" />
        </Example>
      </Section>

      <Section title="Rules">
        <DoDont
          doExample={<IconButton icon={Trash2} label="Delete credential" />}
          doText="Give every icon-only button a label that says what it does to what."
          dontExample={<Button variant="ghost" icon={Trash2}>{""}</Button>}
          dontText="An icon with no name is silent to a screen reader and a guess for everyone else."
        />
      </Section>
    </DocPage>
  );
}
