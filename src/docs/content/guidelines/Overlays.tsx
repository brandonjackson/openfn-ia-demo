import { useState } from "react";
import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Button from "../../../components/primitives/Button";
import Code from "../../../components/primitives/Code";
import CodeBlock from "../../../components/primitives/CodeBlock";
import ConfirmModal from "../../../components/primitives/ConfirmModal";
import DropdownMenu from "../../../components/primitives/DropdownMenu";
import IconButton from "../../../components/primitives/IconButton";
import Modal from "../../../components/primitives/Modal";
import FormField from "../../../components/primitives/FormField";
import { TextInput } from "../../../components/primitives/FormControls";
import Surface from "../../../components/primitives/Surface";
import Text from "../../../components/primitives/Text";
import { Bullets, DocPage, P, Section } from "../../parts/Doc";
import { Example } from "../../parts/Example";

/** Menus, popovers, dialogs and confirms. */
export default function Overlays() {
  const [last, setLast] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    setBusy(false);
    setConfirm(false);
    setLast("Deleted intake-v2 (not really)");
  };

  return (
    <DocPage
      eyebrow="Guidelines"
      title="Menus and dialogs"
      lead="Things that float above the page all share one frame and one set of manners: they open from something you pressed, close on Escape or a click outside, and give focus back when they go."
    >
      <Section title="Menus">
        <P>
          <Code>DropdownMenu</Code> opens a list of actions from any trigger; a row's ⋮ is <Code>ActionMenu</Code>. Destructive
          items go last, in red, after a divider.
        </P>
        <Example>
          <DropdownMenu
            ariaLabel="Workflow actions"
            onSelect={(id) => setLast(`Picked “${id}”`)}
            trigger={({ open, toggle }) => <IconButton icon={MoreVertical} label="Workflow actions" active={open} onClick={toggle} aria-expanded={open} />}
            items={[
              { id: "rename", label: "Rename", icon: Pencil },
              { id: "duplicate", label: "Duplicate", icon: Copy },
              { id: "delete", label: "Delete", icon: Trash2, tone: "danger", divider: true },
            ]}
          />
          {last && <Text tone="muted">{last}</Text>}
        </Example>
        <P>
          Writing your own popover? Use <Code>usePopover</Code> (or <Code>useDismiss</Code> when the open state is
          controlled). Don't hand-write the outside-click and Escape effect.
        </P>
        <CodeBlock
          tone="light"
          code={`const { open, toggle, close, ref } = usePopover();
return (
  <div ref={ref}>
    <Button onClick={toggle} aria-expanded={open}>Period</Button>
    {open && <Surface variant="popover">…</Surface>}
  </div>
);`}
        />
      </Section>

      <Section title="Surfaces">
        <P>
          <Code>Surface</Code> is the white, bordered, shadowed frame of anything that floats: <Code>raised</Code> for bars and
          cards just off the page, <Code>floating</Code> for panels and dialogs, <Code>popover</Code> for menus.
        </P>
        <Example backdrop>
          {(["raised", "floating", "popover"] as const).map((v) => (
            // Surface is only the frame: the caller adds the layout.
            <Surface key={v} variant={v} className="px-5 py-4">
              <Text tone="muted" size="xs">
                {v}
              </Text>
            </Surface>
          ))}
        </Example>
      </Section>

      <Section title="Dialogs and confirms">
        <P>
          A <Code>Modal</Code> is for a short task that needs the person's full attention: a form to make something. A{" "}
          <Code>ConfirmModal</Code> is for an action that can't be undone, and says what will happen. Give it a{" "}
          <Code>confirmPhrase</Code> to type for actions that destroy a lot.
        </P>
        <Example>
          <Button variant="secondary" onClick={() => setModal(true)}>
            Open a modal
          </Button>
          <Button variant="danger" onClick={() => setConfirm(true)}>
            Delete sandbox
          </Button>
        </Example>
        <Modal
          open={modal}
          title="New collection"
          onClose={() => setModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModal(false)}>Make collection</Button>
            </>
          }
        >
          <FormField label="Name" htmlFor="docs-modal-name" hint="Unique in the project.">
            <TextInput id="docs-modal-name" />
          </FormField>
        </Modal>
        <ConfirmModal
          open={confirm}
          title="Delete intake-v2?"
          confirmLabel={busy ? "Deleting…" : "Delete sandbox"}
          confirmPhrase="intake-v2"
          confirmPhraseLabel="Type the sandbox's name to confirm"
          busy={busy}
          onConfirm={remove}
          onClose={() => setConfirm(false)}
        >
          Its workflows and their runs will be deleted. This can't be undone.
        </ConfirmModal>
        <Bullets
          items={[
            <>The title is a question or a task ("Delete intake-v2?", "New collection"); the confirm button repeats the action.</>,
            <>While it runs, the confirm button says so and is <Code>aria-disabled</Code> (pass <Code>busy</Code>), as in <Code>Forms</Code>.</>,
            <>Don't stack a modal on a modal. If a task needs two steps, make it one flow.</>,
          ]}
        />
      </Section>
    </DocPage>
  );
}
