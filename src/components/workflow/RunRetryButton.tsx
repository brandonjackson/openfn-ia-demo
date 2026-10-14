import { MenuItem } from "../Menu";
import SplitButton from "../SplitButton";
import NewRunButton from "./NewRunButton";

interface Props {
  /** A finished run can be retried: "Retry" with a "Run (New Work Order)" menu. */
  isRetryable: boolean;
  disabled?: boolean;
  onRun: () => void;
  onRetry: () => void;
  runLabel?: string;
}

/** Run / Retry button (RunRetryButton.tsx), primary variant. */
export default function RunRetryButton({ isRetryable, disabled = false, onRun, onRetry, runLabel = "Run" }: Props) {
  if (!isRetryable) {
    return <NewRunButton onClick={onRun} disabled={disabled} text={runLabel} />;
  }
  return (
    <SplitButton
      onClick={onRetry}
      disabled={disabled}
      tooltip="⌘ Enter"
      menuLabel="Open options"
      menu={
        <MenuItem icon="hero-play-solid" description="⌘ ⇧ Enter" onClick={onRun}>
          Run (New Work Order)
        </MenuItem>
      }
    >
      <span className="hero-play-mini h-4 w-4" />
      Retry
    </SplitButton>
  );
}
