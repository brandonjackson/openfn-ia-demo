import { PanelBottom, PanelLeft, Sparkles } from "lucide-react";
import IconToggleButton from "../IconToggleButton";

interface Props {
  /** The explorer toggle only applies in code mode; leave unset to hide it. */
  explorerOpen?: boolean;
  onToggleExplorer?: () => void;
  panelOpen: boolean;
  onTogglePanel: () => void;
  assistantOpen: boolean;
  onToggleAssistant: () => void;
}

/**
 * The layout toggles at the right of the toolbar, as in an IDE: the explorer
 * on the left, the panel along the bottom and the assistant on the right.
 * Each reads pressed while its area is showing.
 */
export default function LayoutControls({
  explorerOpen,
  onToggleExplorer,
  panelOpen,
  onTogglePanel,
  assistantOpen,
  onToggleAssistant,
}: Props) {
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Layout">
      {onToggleExplorer && (
        <IconToggleButton icon={PanelLeft} label="Explorer" hint="Ctrl/⌘ + B" pressed={explorerOpen} onClick={onToggleExplorer} />
      )}
      <IconToggleButton icon={PanelBottom} label="Panel" hint="Ctrl/⌘ + J" pressed={panelOpen} onClick={onTogglePanel} />
      <IconToggleButton icon={Sparkles} label="Assistant" hint="Ctrl/⌘ + K" pressed={assistantOpen} onClick={onToggleAssistant} />
    </div>
  );
}
