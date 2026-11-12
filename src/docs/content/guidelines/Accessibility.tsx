import { X } from "lucide-react";
import Button from "../../../components/primitives/Button";
import Code from "../../../components/primitives/Code";
import DataTable from "../../../components/primitives/DataTable";
import IconButton from "../../../components/primitives/IconButton";
import StatusPill from "../../../components/domain/StatusPill";
import Text from "../../../components/primitives/Text";
import { Bullets, DocPage, P, Section } from "../../parts/Doc";
import { DoDont } from "../../parts/Example";

const built = [
  { component: "Button", gives: "A real <button> with a type, focus ring, and aria-disabled support while busy." },
  { component: "IconButton", gives: "A required label: the accessible name and the tooltip. aria-pressed for toggles." },
  { component: "FormField", gives: "A <label> tied to its control, the error linked and read out." },
  { component: "NavItem", gives: "aria-current on the page you're on; menu and option roles inside menus." },
  { component: "Modal, ConfirmModal", gives: "Focus moves in and back, Escape closes, the title names the dialog." },
  { component: "DropdownMenu, Popover", gives: "Opens from a button with aria-expanded; Escape and a click outside close it." },
  { component: "StatusPill", gives: "A dot alone still says its status to a screen reader." },
  { component: "Text", gives: "role=\"status\" and role=\"alert\" for changes that should be read out." },
];

/** What the primitives do for you, and what's still up to you. */
export default function Accessibility() {
  return (
    <DocPage
      eyebrow="Guidelines"
      title="Accessibility"
      lead="OpenFn is public infrastructure, used by people with every kind of ability, device and connection. Accessibility lives in the primitives, so a screen built from them starts out accessible. The rest is a handful of habits."
    >
      <Section title="What the primitives give you">
        <DataTable
          rows={built}
          getRowKey={(r) => r.component}
          columns={[
            { key: "component", header: "Component", render: (r) => <Code>{r.component}</Code> },
            { key: "gives", header: "Gives you", render: (r) => <Text>{r.gives}</Text> },
          ]}
        />
        <P>
          This is the biggest reason not to hand-roll a <Code>&lt;button&gt;</Code> or an <Code>&lt;input&gt;</Code> in a
          page: the ratchet counts them, and every one is a place this list stops being true.
        </P>
      </Section>

      <Section title="Habits">
        <Bullets
          items={[
            <><strong>Every control has a name.</strong> Icon-only buttons take a <Code>label</Code> that says what they do to what: "Delete credential", not "Delete" or "Trash".</>,
            <><strong>Don't disable to explain.</strong> A disabled button can't be focused and says nothing. Keep it enabled and say what's missing (<Code>Forms</Code>).</>,
            <><strong>Move focus on purpose.</strong> After a failed submit, to the first field with a problem; after closing a dialog, back to what opened it.</>,
            <><strong>Announce changes.</strong> A count a search narrows is <Code>role="status"</Code>; a refusal after a press is <Code>role="alert"</Code>.</>,
            <><strong>Colour is never the only signal.</strong> A failed run is red and says "Failed"; a required field says so.</>,
            <><strong>Headings in order.</strong> <Code>PageHeader</Code> is the page's h1; sections are h2 from <Code>SectionHeading</Code>.</>,
            <><strong>Works at 200% zoom and on a phone.</strong> Use the layout kit; it wraps and stacks.</>,
          ]}
        />
      </Section>

      <Section title="Rules">
        <DoDont
          doExample={<IconButton icon={X} label="Close run panel" />}
          doText="Name what it does, to what."
          dontExample={<Button variant="ghost" icon={X}>{""}</Button>}
          dontText="No name: silent to a screen reader."
        />
        <DoDont
          doExample={<StatusPill status="failed" />}
          doText="Colour and a word."
          dontExample={<Text tone="danger">●</Text>}
          dontText="A red dot alone means nothing to someone who can't see red."
        />
      </Section>
    </DocPage>
  );
}
