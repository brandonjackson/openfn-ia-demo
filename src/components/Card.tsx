import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import SectionHeader from "./SectionHeader";

export type CardPadding = "none" | "sm" | "md" | "lg";

const paddings: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

interface Props {
  /** With a title, description or action, the card opens with a SectionHeader. */
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  padding?: CardPadding;
  /** Gray-50 fill, for a panel nested inside a white one. */
  muted?: boolean;
  /** Dashed outline, for drop zones and placeholders. */
  dashed?: boolean;
  as?: "div" | "section" | "li" | "article";
  /** Inventory id for the annotations panel (`data-annotation`). */
  annotation?: string;
  id?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * The bordered, rounded panel every grouped block of content sits in:
 * settings sections, detail panels, stat tiles, form cards, list items.
 */
export default function Card({
  title,
  description,
  action,
  padding = "md",
  muted = false,
  dashed = false,
  as: Tag = "div",
  annotation,
  id,
  className,
  children,
}: Props) {
  const hasHeader = title || description || action;
  return (
    <Tag
      id={id}
      data-ui="card"
      data-annotation={annotation}
      className={cn(
        "rounded-lg",
        dashed ? "border-2 border-dashed border-gray-300" : "border border-gray-200",
        muted ? "bg-gray-50" : !dashed && "bg-white shadow-xs",
        paddings[padding],
        hasHeader && "space-y-4",
        className
      )}
    >
      {hasHeader && <SectionHeader title={title} subtitle={description} action={action} />}
      {children}
    </Tag>
  );
}
