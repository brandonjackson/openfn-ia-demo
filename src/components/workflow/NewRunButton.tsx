import Button from "../Button";
import { MenuItem } from "../Menu";
import SplitButton from "../SplitButton";

interface Props {
  onClick: () => void;
  /** When given, renders a split button whose menu offers "Run with custom input". */
  onRunWithCustomInputClick?: () => void;
  disabled?: boolean;
  isRunning?: boolean;
  text?: string;
  variant?: "primary" | "secondary";
  /** Hover text (Lightning shows the shortcut, or why it's disabled). */
  tooltip?: string;
}

/**
 * The Run button (collaborative-editor/components/NewRunButton.tsx): play
 * icon + label, optionally split with a chevron menu.
 */
export default function NewRunButton({
  onClick,
  onRunWithCustomInputClick,
  disabled = false,
  isRunning = false,
  text = "Run",
  variant = "primary",
  tooltip = "⌘ Enter",
}: Props) {
  const isDisabled = disabled || isRunning;
  const content = (
    <>
      <span className={isRunning ? "hero-arrow-path h-4 w-4 animate-spin" : "hero-play-solid h-4 w-4"} />
      {isRunning ? "Processing" : text}
    </>
  );

  if (!onRunWithCustomInputClick) {
    return (
      <Button theme={variant} onClick={onClick} disabled={isDisabled} tooltip={tooltip}>
        {content}
      </Button>
    );
  }

  return (
    <SplitButton
      theme={variant}
      onClick={onClick}
      disabled={isDisabled}
      tooltip={tooltip}
      menuLabel="Open run options"
      menu={
        <MenuItem icon="hero-play" description="⌘ ⇧ Enter" onClick={onRunWithCustomInputClick}>
          Run with custom input
        </MenuItem>
      }
    >
      {content}
    </SplitButton>
  );
}
