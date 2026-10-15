import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { useCopy } from "../utils/useCopy";
import Button, { type ButtonSize } from "./Button";
import IconButton from "./IconButton";

/**
 * Copies `value` to the clipboard and says so for two seconds. With
 * children it's a secondary Button ("Copy Code" → "Copied!"); without, a
 * clipboard IconButton that turns into a green check.
 */
export default function CopyButton({
  value,
  label = "Copy to clipboard",
  size,
  id,
  className,
  children,
}: {
  value: string;
  /** Accessible name and tooltip of the icon-only button. */
  label?: string;
  /** `xs` only applies with children; the icon button is `sm` at its smallest. */
  size?: ButtonSize;
  id?: string;
  className?: string;
  /** Button text; omit for an icon-only button. */
  children?: ReactNode;
}) {
  const { copied, copy } = useCopy(value);
  if (children) {
    return (
      <Button id={id} theme="secondary" size={size} onClick={copy} className={className}>
        {copied ? "Copied!" : children}
      </Button>
    );
  }
  return (
    <IconButton
      id={id}
      icon={copied ? "hero-check" : "hero-clipboard-document"}
      label={copied ? "Copied!" : label}
      size={size === "xs" ? "sm" : size}
      onClick={copy}
      className={cn(copied && "text-success-600 hover:text-success-600", className)}
    />
  );
}
