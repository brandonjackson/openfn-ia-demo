import type { ReactNode } from "react";

const tones = {
  /** Body copy. */
  default: "text-gray-700",
  /** Names and values that lead a row. */
  strong: "font-medium text-gray-900",
  /** Secondary detail: timestamps, counts, hints. */
  muted: "text-gray-500",
  /** The quietest detail, such as an id beside a name. */
  subtle: "text-gray-400",
  /** Something went wrong. */
  danger: "text-red-600",
  /** Something went right. */
  success: "text-green-700",
};

export type TextTone = keyof typeof tones;

interface Props {
  tone?: TextTone;
  /** `xs` 12px, `sm` 14px (the default), `md` 16px. */
  size?: "xs" | "sm" | "md";
  /** Monospaced, for ids, paths and code. */
  mono?: boolean;
  /** Cuts a long value off with an ellipsis, showing it in full on hover. */
  truncate?: boolean;
  /** A paragraph rather than a run of text inside a line. */
  block?: boolean;
  /** Keeps it on one line, e.g. a date in a table cell. */
  nowrap?: boolean;
  /** `status` reads a change out politely, e.g. a count that a search narrows; `alert` reads it out at once, e.g. what a form is missing. */
  role?: "status" | "alert";
  /** For a control's `aria-describedby`, e.g. the error under it. */
  id?: string;
  children?: ReactNode;
}

/**
 * A run of text in one of the app's few tones and sizes, so components never
 * pick colours or font sizes for themselves.
 */
export default function Text({ tone = "default", size = "sm", mono = false, truncate = false, block = false, nowrap = false, role, id, children }: Props) {
  const sizes = { xs: "text-xs", sm: "text-sm", md: "text-base" };
  const className = `${tones[tone]} ${sizes[size]} ${mono ? "font-mono" : ""} ${truncate ? "block min-w-0 truncate" : ""} ${nowrap ? "whitespace-nowrap" : ""}`;
  const title = truncate && typeof children === "string" ? children : undefined;
  return block ? (
    <p id={id} className={className} role={role}>
      {children}
    </p>
  ) : (
    <span id={id} className={className} title={title} role={role}>
      {children}
    </span>
  );
}
