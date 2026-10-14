import { cn } from "../../utils/cn";

/** The round chat-bubble button at the end of the editor header (AIButton.tsx). */
export default function AIButton({
  isOpen = false,
  onClick,
  disabled = false,
  className,
}: {
  isOpen?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={`${isOpen ? "Close AI Assistant" : "Open AI Assistant"} (⌘ K)`}
      className={cn(
        "rounded-full p-2",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isOpen
          ? "bg-primary-600 text-white hover:enabled:bg-primary-500"
          : "bg-primary-100 text-primary-600 hover:enabled:bg-primary-200",
        className
      )}
    >
      <span className="hero-chat-bubble-left-right size-5 block" aria-hidden="true" />
    </button>
  );
}
