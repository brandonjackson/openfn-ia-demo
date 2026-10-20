import { ArrowUp, Sparkles } from "lucide-react";
import Button from "./Button";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}

/**
 * The big "what would you like to build?" box: a free-text prompt for the
 * AI builder, with a send button. Enter sends; Shift+Enter adds a new line.
 */
export default function BuildPrompt({
  value,
  onChange,
  onSubmit,
  placeholder = "Describe a public service you'd like to build…",
}: Props) {
  return (
    <form
      className="rounded-xl border border-gray-300 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit?.();
          }
        }}
        rows={4}
        placeholder={placeholder}
        aria-label="What would you like to build?"
        className="block w-full resize-none rounded-t-xl border-0 bg-transparent px-4 pt-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
      />
      <div className="flex items-center justify-between gap-3 px-3 pb-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
          <Sparkles size={12} />
          The assistant will draft workflows and channels from your org's systems.
        </span>
        <Button type="submit" size="sm" icon={ArrowUp} disabled={!value.trim()}>
          Build
        </Button>
      </div>
    </form>
  );
}
