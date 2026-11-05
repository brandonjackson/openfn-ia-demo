import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MoreHorizontal, Play, Sparkles } from "lucide-react";
import EditorTopBar from "./EditorTopBar";
import Button from "../primitives/Button";
import IconButton from "../primitives/IconButton";
import SegmentedControl from "../primitives/SegmentedControl";

const meta: Meta<typeof EditorTopBar> = {
  title: "Patterns/EditorTopBar",
  component: EditorTopBar,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="bg-gray-50 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EditorTopBar>;

function Demo({ asideHidden: initiallyHidden = false }: { asideHidden?: boolean }) {
  const [view, setView] = useState("canvas");
  const [asideHidden, setAsideHidden] = useState(initiallyHidden);
  return (
    <EditorTopBar
      start={
        <>
          <IconButton icon={MoreHorizontal} label="Menu" onClick={() => {}} />
          <span className="truncate px-2 text-sm font-semibold text-gray-900">A long document name that truncates first</span>
        </>
      }
      middle={
        <SegmentedControl
          variant="pill"
          size="md"
          options={[{ id: "canvas", label: "Canvas" }, { id: "code", label: "Code" }]}
          value={view}
          onChange={setView}
        />
      }
      end={
        <Button variant="dark" size="sm" icon={Play} onClick={() => setAsideHidden(false)}>
          Run
        </Button>
      }
      aside={<IconButton variant="toggle" size="md" icon={Sparkles} label="Side column" onClick={() => setAsideHidden(true)} />}
      asideHidden={asideHidden}
    />
  );
}

/** Three groups across the top, and one on its own at the far right. Click it to fold it away; Run brings it back. */
export const Default: Story = { render: () => <Demo /> };

/** The last group folded away, as while the assistant is open. */
export const AsideHidden: Story = { render: () => <Demo asideHidden /> };
