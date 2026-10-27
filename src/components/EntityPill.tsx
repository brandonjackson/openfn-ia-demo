import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import AdaptorLogo from "./AdaptorLogo";
import { AdaptorIcon } from "./workflow/AdaptorIcon";
import { hasAdaptorLogo } from "../adaptor-lookup";

export type EntityPillSize = "xs" | "sm" | "md";

interface Props {
  name: string;
  /** Adaptor id for the icon tile; without it the logo is looked up by `name`. */
  adaptor?: string;
  /** Shown in place of the adaptor tile, e.g. a trigger's glyph. */
  icon?: ReactNode;
  /** Muted text after the name, e.g. the adaptor's pinned version. */
  suffix?: ReactNode;
  /** Shown at the right edge, e.g. an `IconButton` that removes the pill. */
  trailing?: ReactNode;
  /**
   * `pill` (the default) is fully rounded: every system, adaptor and trigger,
   * on the canvas and in the code view alike. `tag` has small corners, for
   * things attached to something else, like a reference in the chat input.
   */
  shape?: "pill" | "tag";
  /** `xs` for headers and dense rows, `sm` for cards and panels, `md` (default) for rows of pills. */
  size?: EntityPillSize;
  /**
   * `default` is a white bordered pill, `suggested` a dashed "+" pill for a
   * system that isn't connected yet, `accent` the brand tint for what a
   * message to the assistant is about.
   */
  tone?: "default" | "suggested" | "accent";
  /** Link target, e.g. a connected system's page. */
  to?: string;
  /** Makes the pill a button, e.g. to open a step's config. */
  onClick?: () => void;
  title?: string;
}

const sizing: Record<EntityPillSize, string> = {
  xs: "gap-1 py-px pl-0.5 text-[11px]",
  sm: "gap-1.5 py-0.5 pl-0.5 text-xs",
  md: "gap-2 py-1 pl-1 text-sm",
};

const endPadding: Record<EntityPillSize, string> = { xs: "pr-1.5", sm: "pr-2", md: "pr-3" };

const tones = {
  default: { box: "border border-gray-200 bg-white text-gray-800", muted: "text-gray-400" },
  suggested: { box: "border border-dashed border-gray-300 bg-white text-gray-600", muted: "text-gray-400" },
  accent: { box: "border border-indigo-200 bg-indigo-50 text-indigo-800", muted: "text-indigo-400" },
};

/**
 * An icon tile and a name (and maybe a suffix) in a bordered pill: a
 * connected system, a step's adaptor, a trigger, or what a message to the
 * assistant is about. With `to` it's a link, with `onClick` a button, and
 * otherwise a static label (e.g. inside a clickable card).
 */
export default function EntityPill({
  name,
  adaptor,
  icon,
  suffix,
  trailing,
  shape = "pill",
  size = "md",
  tone = "default",
  to,
  onClick,
  title,
}: Props) {
  const interactive = Boolean(to || onClick);
  const { box, muted } = tones[tone];
  const hover = interactive ? "hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700" : "";
  const className = `inline-flex max-w-full flex-shrink-0 items-center whitespace-nowrap font-medium transition-colors ${
    shape === "pill" ? "rounded-full" : "rounded-md"
  } ${sizing[size]} ${trailing ? "pr-0.5" : endPadding[size]} ${box} ${hover}`;

  // Adaptors without a logo fall back to their lettered tile, as on the canvas cards.
  const tile =
    icon ??
    (adaptor && !hasAdaptorLogo(adaptor) ? (
      <AdaptorIcon adaptor={adaptor} size="xs" />
    ) : (
      <AdaptorLogo adaptor={adaptor} name={name} size={size === "md" ? "xs" : "2xs"} />
    ));

  const content = (
    <>
      <span className="inline-flex flex-shrink-0">{tile}</span>
      <span className="truncate">{name}</span>
      {suffix && <span className={`font-normal ${muted}`}>{suffix}</span>}
      {tone === "suggested" && <Plus size={13} className="flex-shrink-0 text-gray-400" />}
      {trailing}
    </>
  );

  if (to) {
    return (
      <Link to={to} title={title} className={className}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" title={title} onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <span title={title} className={className}>
      {content}
    </span>
  );
}
