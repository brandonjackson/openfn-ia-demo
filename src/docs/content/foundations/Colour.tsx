import Badge from "../../../components/primitives/Badge";
import Button from "../../../components/primitives/Button";
import Callout from "../../../components/primitives/Callout";
import Code from "../../../components/primitives/Code";
import CodeBlock from "../../../components/primitives/CodeBlock";
import SegmentedControl from "../../../components/primitives/SegmentedControl";
import Stack from "../../../components/primitives/Stack";
import Text from "../../../components/primitives/Text";
import StatusPill from "../../../components/domain/StatusPill";
import { useTheme } from "../../../theme/theme-context";
import ColorRamp from "../../parts/ColorRamp";
import { Bullets, DocPage, P, Section } from "../../parts/Doc";
import { DoDont, Example } from "../../parts/Example";

const hues = [
  { hue: "gray", role: "Most of the interface: text, borders, surfaces" },
  { hue: "indigo", role: "The brand accent: primary actions, links, what's selected" },
  { hue: "red", role: "Danger and failure: errors, destructive actions, failed runs" },
  { hue: "green", role: "Success: a run that worked, something live" },
  { hue: "amber", role: "Caution: a sandbox, somewhere that isn't the real thing" },
  { hue: "yellow", role: "Draft and waiting" },
];

/** The colour tokens, what each means, and theming. */
export default function Colour() {
  const { themeId, setTheme, themes } = useTheme();
  return (
    <DocPage
      eyebrow="Foundations"
      title="Colour"
      lead="Colour carries meaning, so most of OpenFn is grey and white. When something is coloured, it's telling you something: this is the main action, this went wrong, you're in a sandbox."
    >
      <Section title="Try a theme">
        <P>
          Every colour goes through a theme token, so a theme re-skins the whole app without touching a component. Switch
          theme here and every swatch and example on this site follows.
        </P>
        <SegmentedControl
          label="Theme"
          options={themes.map((t) => ({ id: t.id, label: t.name }))}
          value={themeId}
          onChange={(id) => setTheme(id as typeof themeId)}
        />
        <Text tone="muted">{themes.find((t) => t.id === themeId)?.description}</Text>
      </Section>

      <Section title="The palette">
        <P>
          These are Tailwind's scales, read live from the active theme's tokens (<Code>--color-indigo-600</Code> and so on).
          Each has a job; use a hue for its job and not for decoration.
        </P>
        <Stack gap="lg">
          {hues.map((h) => (
            <ColorRamp key={h.hue} hue={h.hue} role={h.role} />
          ))}
        </Stack>
      </Section>

      <Section title="Meaning in use">
        <P>Components pick the colour for you. Pass the meaning and let the component decide how it looks.</P>
        <Example
          code={`<Button>Save</Button>
<Button variant="danger">Delete project</Button>
<Button variant="caution">Sandbox: intake-v2</Button>
<StatusPill status="success" />
<StatusPill status="failed" />
<Badge label="Live" />
<Badge label="Draft" />`}
        >
          <Button>Save</Button>
          <Button variant="danger">Delete project</Button>
          <Button variant="caution">Sandbox: intake-v2</Button>
          <StatusPill status="success" />
          <StatusPill status="failed" />
          <Badge label="Live" />
          <Badge label="Draft" />
        </Example>
        <Bullets
          items={[
            <><strong>Text</strong> uses the tones of <Code>Text</Code>: <Code>strong</Code> for names, <Code>default</Code> for body, <Code>muted</Code> for secondary detail, <Code>subtle</Code> for the quietest.</>,
            <><strong>Badges</strong> are muted: each hue is mixed toward grey so a status reads as a quiet note beside a name, not a bright chip.</>,
            <><strong>Red</strong> is a touch darker and softer than Tailwind's, so errors read as serious rather than alarming.</>,
            <><strong>Run statuses</strong> are always <Code>StatusPill</Code>, never a <Code>Badge</Code>, so "failed" is the same red everywhere.</>,
          ]}
        />
      </Section>

      <Section title="Rules">
        <P>
          Every colour is a Tailwind colour utility (<Code>bg-*</Code>, <Code>text-*</Code>, <Code>border-*</Code>,{" "}
          <Code>fill-*</Code>, <Code>stroke-*</Code>) or a named CSS variable from <Code>src/theme/theme.css</Code>. Never a
          hex, <Code>rgb()</Code> or <Code>hsl()</Code> literal, including SVG attributes and inline styles: a literal
          doesn't change with the theme.
        </P>
        <DoDont
          doExample={<CodeBlock tone="light" code={`<path className="stroke-indigo-500" />`} />}
          doText="Use a utility, so the theme can re-skin it."
          dontExample={<CodeBlock tone="light" code={`<path stroke="#6366f1" />`} />}
          dontText="A hex value stays indigo under every theme."
        />
        <DoDont
          doExample={<Callout variant="danger" title="Couldn't delete the project">It still has running workflows.</Callout>}
          doText="Save red for things that went wrong or can't be undone."
          dontExample={<Button variant="danger">Export</Button>}
          dontText="A red button for an everyday action makes people hesitate."
        />
      </Section>

      <Section title="How theming works">
        <P>
          Tailwind 4 compiles every colour, radius, shadow and font utility to a CSS variable, such as{" "}
          <Code>bg-gray-50</Code> to <Code>var(--color-gray-50)</Code>. A theme redefines those same variables under{" "}
          <Code>html[data-theme="…"]</Code>, so swapping the attribute re-skins everything. A few things a token can't reach
          (the sidebar, buttons, fields) are styled per theme through <Code>data-ui</Code> hooks the components carry.
        </P>
        <CodeBlock
          tone="light"
          code={`/* src/theme/theme.css */
html[data-theme="lightning-v2"] {
  --font-sans: "Inter var", "Inter", ui-sans-serif, system-ui, sans-serif;
  --app-bg: var(--color-gray-100);
}`}
        />
        <P>
          To add a theme, add an entry in <Code>src/theme/themes.ts</Code>, then a token block in <Code>theme.css</Code> and,
          if needed, a component layer scoped to the same <Code>data-theme</Code>.
        </P>
      </Section>
    </DocPage>
  );
}
