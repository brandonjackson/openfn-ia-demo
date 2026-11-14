import { useState } from "react";
import { Database, Download, KeyRound, Plus, Search, Settings, Trash2, Users, Workflow, X } from "lucide-react";
import PageHeader from "../../../components/patterns/PageHeader";
import Badge from "../../../components/primitives/Badge";
import Button from "../../../components/primitives/Button";
import Callout from "../../../components/primitives/Callout";
import Card from "../../../components/primitives/Card";
import Code from "../../../components/primitives/Code";
import EmptyState from "../../../components/primitives/EmptyState";
import FormField from "../../../components/primitives/FormField";
import { TextInput } from "../../../components/primitives/FormControls";
import Grid from "../../../components/primitives/Grid";
import IconButton from "../../../components/primitives/IconButton";
import Inline from "../../../components/primitives/Inline";
import NavItem from "../../../components/primitives/NavItem";
import SegmentedControl from "../../../components/primitives/SegmentedControl";
import Stack from "../../../components/primitives/Stack";
import Text from "../../../components/primitives/Text";
import TextLink from "../../../components/primitives/TextLink";
import EntityPill from "../../../components/domain/EntityPill";
import StatusPill from "../../../components/domain/StatusPill";
import { Bullets, P, Section } from "../../parts/Doc";
import { DoDont, Example } from "../../parts/Example";

/*
 * Hand-written guidance for the components people reach for most: live
 * examples, when to use each, and what to avoid. Each sits above the props
 * the catalogue reads from the source. Add one here when a component needs
 * more than its comments can say.
 */

export function ButtonGuide() {
  return (
    <>
      <Section title="Examples">
        <Example
          code={`<Button>Save changes</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger">Delete project</Button>
<Button variant="ghost" icon={Download}>Export</Button>
<Button variant="caution">Sandbox: intake-v2</Button>`}
        >
          <Button>Save changes</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="danger">Delete project</Button>
          <Button variant="ghost" icon={Download}>
            Export
          </Button>
          <Button variant="caution">Sandbox: intake-v2</Button>
        </Example>
        <Example code={`<Button size="xs">Extra small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button icon={Plus}>New workflow</Button>`}>
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button icon={Plus}>New workflow</Button>
        </Example>
      </Section>
      <Section title="Usage">
        <Bullets
          items={[
            <><Code>primary</Code> for the one main action on a page or in a dialog. One per view.</>,
            <><Code>secondary</Code> for everything else, including Cancel.</>,
            <><Code>danger</Code> for actions that destroy something, usually in a confirm. <Code>outline-danger</Code> for the same action before it's confirmed, in a danger zone.</>,
            <><Code>ghost</Code> for quiet actions in toolbars and rows. <Code>caution</Code> marks somewhere that isn't the real thing, such as a sandbox.</>,
            <><Code>sm</Code> beside a section heading; <Code>md</Code> for form submits.</>,
            <>Labels are sentence case and start with a verb.</>,
          ]}
        />
        <DoDont
          doExample={<Button aria-disabled>Saving…</Button>}
          doText="While its action runs, say so and mark it aria-disabled, so it keeps focus."
          dontExample={<Button disabled>Save</Button>}
          dontText="Don't disable it to say a form isn't ready. Say what's missing under the field."
        />
      </Section>
    </>
  );
}

export function IconButtonGuide() {
  const [pressed, setPressed] = useState(true);
  return (
    <>
      <Section title="Examples">
        <Example code={`<IconButton icon={X} label="Close panel" />
<IconButton icon={Settings} label="Settings" size="sm" />
<IconButton icon={Users} label="Show assistant" variant="toggle" pressed={pressed} onClick={…} />
<IconButton icon={Database} label="Changes" count={3} />`}>
          <IconButton icon={X} label="Close panel" />
          <IconButton icon={Settings} label="Settings" size="sm" />
          <IconButton icon={Users} label="Show assistant" variant="toggle" pressed={pressed} onClick={() => setPressed(!pressed)} />
          <IconButton icon={Database} label="Changes" count={3} />
        </Example>
      </Section>
      <Section title="Usage">
        <Bullets
          items={[
            <>Every icon-only button is an <Code>IconButton</Code>. Its <Code>label</Code> is the accessible name and the tooltip, so say what it does to what.</>,
            <><Code>ghost</Code> for close, collapse, copy and ⋮; <Code>toggle</Code> for something that stays on while what it opens is showing.</>,
            <>Sizes follow where it sits: <Code>2xs</Code> in a pill, <Code>xs</Code> in dense rows, <Code>sm</Code> in panel headers, <Code>md</Code> in the toolbar and dialogs.</>,
          ]}
        />
      </Section>
    </>
  );
}

export function CardGuide() {
  return (
    <>
      <Section title="Examples">
        <Example backdrop column code={`<Card title="Data retention" description="How long run data is kept." actions={<Button size="sm">Save</Button>}>
  …
</Card>
<Grid columns={3}>
  <Card to="/projects" padding="sm">…</Card>
</Grid>`}>
          <Card title="Data retention" description="How long run data is kept." actions={<Button size="sm">Save</Button>}>
            <Text tone="muted">Runs older than 90 days are deleted.</Text>
          </Card>
          <Grid columns={3}>
            {[
              { icon: Workflow, t: "Workflows" },
              { icon: KeyRound, t: "Credentials" },
              { icon: Database, t: "Collections" },
            ].map((c) => (
              <Card key={c.t} padding="sm" onClick={() => {}}>
                <Inline>
                  <c.icon size={16} />
                  <Text tone="strong">{c.t}</Text>
                </Inline>
              </Card>
            ))}
          </Grid>
        </Example>
      </Section>
      <Section title="Usage">
        <Bullets
          items={[
            <>A settings section is a <Code>Card</Code> with a <Code>title</Code>, and its controls in <Code>actions</Code>.</>,
            <>With <Code>to</Code> or <Code>onClick</Code> the whole card is the link or button. Don't put other buttons inside one.</>,
            <><Code>padding="sm"</Code> in grids; <Code>flush</Code> around a table or a divided list of rows.</>,
            <>For something that floats over the page (a bar, a panel, a menu) use <Code>Surface</Code> instead.</>,
          ]}
        />
      </Section>
    </>
  );
}

export function StackGuide() {
  return (
    <>
      <Section title="Examples">
        <Example column code={`<Stack gap="sm">
  <Text tone="strong">Members</Text>
  <Text tone="muted">Who can see and change this project.</Text>
</Stack>
<Card flush>
  <Stack divided>…rows…</Stack>
</Card>`}>
          <Stack gap="sm">
            <Text tone="strong">Members</Text>
            <Text tone="muted">Who can see and change this project.</Text>
          </Stack>
          <Card flush>
            <Stack divided>
              <NavItem variant="tree" label="Amara, owner" icon={Users} />
              <NavItem variant="tree" label="Jonas, editor" icon={Users} />
            </Stack>
          </Card>
        </Example>
      </Section>
      <Section title="Usage">
        <P>
          The vertical half of the layout kit. Pick the gap by the relationship: <Code>xs</Code> for a label and its value,{" "}
          <Code>md</Code> (the default) for things in a card, <Code>lg</Code> for sections, <Code>xl</Code> for groups of a
          list. See <TextLink to="/docs/foundations/layout" variant="inline">Layout and spacing</TextLink>.
        </P>
      </Section>
    </>
  );
}

export function InlineGuide() {
  return (
    <>
      <Section title="Examples">
        <Example column code={`<Inline justify="between">
  <Text tone="strong">Nightly sync</Text>
  <StatusPill status="success" />
</Inline>
<Inline wrap>…badges…</Inline>`}>
          <Inline justify="between">
            <Text tone="strong">Nightly sync</Text>
            <StatusPill status="success" />
          </Inline>
          <Inline wrap>
            {["DHIS2", "CommCare", "Salesforce", "Google Sheets", "HTTP"].map((n) => (
              <Badge key={n} label={n} shape="tag" />
            ))}
          </Inline>
        </Example>
      </Section>
      <Section title="Usage">
        <Bullets
          items={[
            <>Side by side, centred on one line by default. <Code>justify="between"</Code> pushes the first and last children to the edges.</>,
            <><Code>wrap</Code> for chips that may need more lines; <Code>stackOnMobile</Code> for a row that should stack on a phone.</>,
            <><Code>grow</Code> lets it take the free width of a row, so its contents can truncate.</>,
          ]}
        />
      </Section>
    </>
  );
}

export function TextGuide() {
  return (
    <>
      <Section title="Examples">
        <Example code={`<Text tone="strong">Patient intake</Text>
<Text tone="muted" size="xs">3 minutes ago</Text>
<Text mono tone="subtle">wo-8f2a91</Text>
<Text tone="danger">Couldn't connect</Text>`}>
          <Text tone="strong">Patient intake</Text>
          <Text tone="muted" size="xs">
            3 minutes ago
          </Text>
          <Text mono tone="subtle">
            wo-8f2a91
          </Text>
          <Text tone="danger">Couldn't connect</Text>
        </Example>
      </Section>
      <Section title="Usage">
        <P>
          Words in pages and domain components go through <Code>Text</Code>, so nothing picks its own colour or size. Use{" "}
          <Code>block</Code> for a paragraph, <Code>truncate</Code> for a value that may be long, and <Code>role</Code> for a
          change that should be read out. See <TextLink to="/docs/foundations/typography" variant="inline">Typography</TextLink>.
        </P>
      </Section>
    </>
  );
}

export function BadgeGuide() {
  return (
    <>
      <Section title="Examples">
        <Example code={`<Badge label="Live" />
<Badge label="Draft" />
<Badge label="Admin" tone="indigo" />
<Badge label="Read only" shape="tag" />`}>
          <Badge label="Live" />
          <Badge label="Draft" />
          <Badge label="Admin" tone="indigo" />
          <Badge label="Read only" shape="tag" />
          <Badge label="JSON" shape="tag" />
        </Example>
      </Section>
      <Section title="Usage">
        <Bullets
          items={[
            <>A <Code>pill</Code> for a status or label; a <Code>tag</Code> for the small square note beside a name, such as a kind or "Read only".</>,
            <>Known labels pick their tone (Live is green, Draft yellow); pass <Code>tone</Code> for anything else.</>,
          ]}
        />
        <DoDont
          doExample={<StatusPill status="failed" />}
          doText="Run statuses are always StatusPill."
          dontExample={<Badge label="Failed" tone="red" />}
          dontText="A Badge for a run status drifts from every other one."
        />
      </Section>
    </>
  );
}

export function CalloutGuide() {
  return (
    <>
      <Section title="Examples">
        <Example column code={`<Callout title="Runs are paused">Turn the trigger on to start them again.</Callout>
<Callout variant="warning" title="This sandbox is behind main">…</Callout>
<Callout variant="danger" role="alert" title="Couldn't save">…</Callout>
<Callout variant="success" title="Project made" />`}>
          <Callout title="Runs are paused">Turn the trigger on to start them again.</Callout>
          <Callout variant="warning" title="This sandbox is behind main">Three workflows changed since you made it.</Callout>
          <Callout variant="danger" role="alert" title="Couldn't save">The workflow has a cycle between two steps.</Callout>
          <Callout variant="success" title="Project made" />
        </Example>
      </Section>
      <Section title="Usage">
        <Bullets
          items={[
            <>For notes, warnings and danger zones that belong to the page. What an action just did (saved, deleted, refused) is a toast instead: see <Code>Toast</Code>.</>,
            <>A refusal about one field goes under that field instead, as <Code>FormField</Code>'s <Code>error</Code>.</>,
          ]}
        />
      </Section>
    </>
  );
}

export function FormFieldGuide() {
  return (
    <>
      <Section title="Examples">
        <Example column code={`<FormField label="Name" htmlFor="name" required hint="Lowercase, with hyphens.">
  <TextInput id="name" />
</FormField>
<FormField label="Name" htmlFor="name2" error="Enter a project name">
  <TextInput id="name2" />
</FormField>`}>
          <FormField label="Name" htmlFor="docs-ff-1" required hint="Lowercase, with hyphens.">
            <TextInput id="docs-ff-1" />
          </FormField>
          <FormField label="Name" htmlFor="docs-ff-2" error="Enter a project name">
            <TextInput id="docs-ff-2" />
          </FormField>
        </Example>
      </Section>
      <Section title="Usage">
        <P>
          Every control sits in a <Code>FormField</Code>. On a failed submit, put what's missing in <Code>error</Code> and focus
          the field. See <TextLink to="/docs/guidelines/forms" variant="inline">Forms</TextLink> for the whole pattern.
        </P>
      </Section>
    </>
  );
}

export function EmptyStateGuide() {
  return (
    <>
      <Section title="Examples">
        <Example column code={`<EmptyState icon={KeyRound} title="No credentials yet." description="…" action={<Button>New credential</Button>} />
<EmptyState icon={Search} title="No workflows match." />`}>
          <EmptyState icon={KeyRound} title="No credentials yet." description="Credentials let workflows sign in to the systems they connect." action={<Button>New credential</Button>} />
          <EmptyState icon={Search} title="No workflows match." />
        </Example>
      </Section>
      <Section title="Usage">
        <P>
          Say what would be here, and offer the action that fills it when the person can take it. See{" "}
          <TextLink to="/docs/guidelines/empty-and-loading" variant="inline">Empty and loading states</TextLink>.
        </P>
      </Section>
    </>
  );
}

export function NavItemGuide() {
  return (
    <>
      <Section title="Examples">
        <Example code={`<NavItem variant="sidebar" label="Workflows" icon={Workflow} active />
<NavItem variant="section" label="Members" icon={Users} active />
<NavItem variant="tree" label="workflow.yaml" />
<NavItem variant="menu" label="Delete" icon={Trash2} danger />`}>
          <Stack gap="xs">
            <NavItem variant="sidebar" label="Workflows" icon={Workflow} active />
            <NavItem variant="sidebar" label="Credentials" icon={KeyRound} />
          </Stack>
          <Stack gap="xs">
            <NavItem variant="section" label="Members" icon={Users} active />
            <NavItem variant="section" label="Settings" icon={Settings} />
          </Stack>
          <Stack gap="xs">
            <NavItem variant="tree" label="workflow.yaml" active />
            <NavItem variant="tree" label="spec.md" />
          </Stack>
          <Stack gap="xs">
            <NavItem variant="menu" label="Rename" />
            <NavItem variant="menu" label="Delete" icon={Trash2} danger />
          </Stack>
        </Example>
      </Section>
      <Section title="Usage">
        <P>
          Every row of a list of places or choices is a <Code>NavItem</Code>: a route link (<Code>to</Code>), an off-site
          link (<Code>href</Code>) or a button (<Code>onClick</Code>). The <Code>variant</Code> follows where it sits:{" "}
          <Code>sidebar</Code> in the side menu, <Code>section</Code> in a settings menu (this site's menu is one),{" "}
          <Code>tree</Code> in the code explorer and lists of choices, <Code>menu</Code> in menus and pickers.
        </P>
      </Section>
    </>
  );
}

export function SegmentedControlGuide() {
  const [a, setA] = useState("All");
  const [b, setB] = useState("Canvas");
  return (
    <>
      <Section title="Examples">
        <Example column code={`<SegmentedControl label="Status" options={["All", "Failed", "Running"]} value={a} onChange={setA} />
<SegmentedControl variant="pill" options={["Canvas", "Explorer"]} value={b} onChange={setB} />`}>
          <SegmentedControl label="Status" options={["All", "Failed", "Running"]} value={a} onChange={setA} />
          <SegmentedControl variant="pill" options={["Canvas", "Explorer"]} value={b} onChange={setB} />
        </Example>
      </Section>
      <Section title="Usage">
        <P>
          <Code>boxed</Code> (the default) filters a list or table; <Code>pill</Code> switches views in a toolbar or a tray
          header. Two to five short options; more than that is a <Code>Select</Code> or a <Code>FilterChip</Code>.
        </P>
      </Section>
    </>
  );
}

export function PageHeaderGuide() {
  return (
    <>
      <Section title="Examples">
        <Example backdrop column code={`<PageHeader
  title="Credentials"
  description="How workflows sign in to the systems they connect."
  actions={<Button icon={Plus}>New credential</Button>}
/>`}>
          <PageHeader title="Credentials" description="How workflows sign in to the systems they connect." actions={<Button icon={Plus}>New credential</Button>} />
          <PageHeader icon={Database} title="patients" badges={<Badge label="Collection" shape="tag" />} description="1,204 items" />
        </Example>
      </Section>
      <Section title="Usage">
        <P>
          The top of every page. Pass the app's <Code>Breadcrumbs</Code> as <Code>breadcrumbs</Code>, the main action in{" "}
          <Code>actions</Code>, and an <Code>icon</Code> or <Code>logo</Code> on a record's page. Filters and search belong
          in the list's toolbar, never here.
        </P>
      </Section>
    </>
  );
}

export function ListPageGuide() {
  return (
    <Section title="Usage">
      <P>
        Every page that lists things uses <Code>ListPage</Code>, which holds the order: header, intro, toolbar, the list
        (or empty), then after. What an action just did is a toast, not part of the page. There's a live, searchable example in{" "}
        <TextLink to="/docs/guidelines/lists" variant="inline">Lists</TextLink> and{" "}
        <TextLink to="/docs/core-concepts#slots" variant="inline">Core concepts</TextLink>.
      </P>
    </Section>
  );
}

export function StatusPillGuide() {
  const statuses = ["success", "failed", "running", "pending", "cancelled"] as const;
  return (
    <>
      <Section title="Examples">
        <Example column code={`<StatusPill status="failed" />
<StatusPill status="failed" variant="dot" />
<StatusPill status="failed" variant="icon" detail="179 ms" />
<StatusPill status="failed" variant="mark" />`}>
          {(["pill", "dot", "icon", "mark"] as const).map((variant) => (
            <Inline key={variant} gap="md">
              <Text tone="muted" size="xs" mono>
                {variant}
              </Text>
              {statuses.map((s) => (
                <StatusPill key={s} status={s} variant={variant} detail={variant === "icon" ? "179 ms" : undefined} />
              ))}
            </Inline>
          ))}
        </Example>
      </Section>
      <Section title="Usage">
        <P>
          The only way the app draws a run's status, so "failed" is the same red everywhere: a <Code>pill</Code> in the
          inspector, a <Code>dot</Code> in a dense row, an <Code>icon</Code> with a duration on a canvas card, a{" "}
          <Code>mark</Code> at the end of an explorer row. Never a <Code>Badge</Code>.
        </P>
      </Section>
    </>
  );
}

export function EntityPillGuide() {
  return (
    <>
      <Section title="Examples">
        <Example code={`<EntityPill name="DHIS2" adaptor="dhis2" />
<EntityPill name="Salesforce" adaptor="salesforce" size="sm" />
<EntityPill name="Google Sheets" tone="suggested" />
<EntityPill name="patients" shape="tag" tone="accent" size="xs" />`}>
          <EntityPill name="DHIS2" adaptor="dhis2" />
          <EntityPill name="Salesforce" adaptor="salesforce" size="sm" />
          <EntityPill name="Google Sheets" tone="suggested" />
          <EntityPill name="patients" icon={<Database size={12} />} shape="tag" tone="accent" size="xs" />
        </Example>
      </Section>
      <Section title="Usage">
        <P>
          Every connected system, step adaptor, trigger and assistant reference: an icon tile and a name in a bordered
          pill. Adaptors are always the round <Code>pill</Code>, on the canvas and in the code view alike; <Code>tag</Code>{" "}
          is for things attached to something else, like a reference in the chat input.
        </P>
      </Section>
    </>
  );
}

export function ToastGuide() {
  return (
    <Section title="Usage">
      <P>
        Don't draw a <Code>Toast</Code> yourself: a wrapper calls <Code>useAnnounce</Code> or{" "}
        <Code>useAnnounceOutcome</Code> from <Code>src/app/announce.ts</Code>, and the app's{" "}
        <Code>ToastStack</Code> shows it. The rules and a live example are in{" "}
        <TextLink to="/docs/guidelines/notifications" variant="inline">Notifications</TextLink>.
      </P>
    </Section>
  );
}
