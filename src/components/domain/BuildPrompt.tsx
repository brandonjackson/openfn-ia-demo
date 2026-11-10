import { useId, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import Button from "../primitives/Button";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Sends the prompt, trimmed. Never called with an empty one: the box says what's missing instead. */
  onSubmit?: (prompt: string) => void;
  placeholder?: string;
}

/**
 * The big "what would you like to build?" box: a free-text prompt for the
 * AI builder, with a send button. Enter sends; Shift+Enter adds a new line.
 * Build stays enabled: sent empty, the box says what's missing and takes focus.
 */
export default function BuildPrompt({
  value,
  onChange,
  onSubmit,
  placeholder = "Describe a public service you'd like to build…",
}: Props) {
  const [error, setError] = useState<string>();
  const box = useRef<HTMLTextAreaElement>(null);
  const errorId = useId();
  const submit = () => {
    const prompt = value.trim();
    if (!prompt) {
      setError("Describe what you'd like to build");
      box.current?.focus();
      return;
    }
    onSubmit?.(prompt);
  };
  return (
    <Stack gap="xs">
      <form
        className="rounded-xl border border-gray-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          ref={box}
          value={value}
          onChange={(e) => {
            if (error) setError(undefined);
            onChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={4}
          placeholder={placeholder}
          aria-label="What would you like to build?"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="block w-full resize-none rounded-t-xl border-0 bg-transparent px-4 pt-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
        />
        <div className="flex items-center justify-between gap-3 px-3 pb-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <Sparkles size={12} />
            The assistant will draft workflows and channels from your org's systems.
          </span>
          <Button type="submit" size="sm" icon={ArrowUp}>
            Build
          </Button>
        </div>
      </form>
      {error && (
        <Text id={errorId} role="alert" tone="danger" size="xs" block>
          {error}
        </Text>
      )}
    </Stack>
  );
}
