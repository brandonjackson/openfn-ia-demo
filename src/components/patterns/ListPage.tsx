import type { ReactNode } from "react";
import Stack from "../primitives/Stack";

interface Props {
  /** The top of the page, e.g. a `PageHeader` with its breadcrumbs and actions. */
  header: ReactNode;
  /** What an action just did, e.g. a Callout saying something was deleted or refused. */
  notice?: ReactNode;
  /**
   * What the list is for, above the toolbar: a feature intro or a row of
   * cards, or the ways to add something. Optional, since most of the time
   * it's hidden. When the toolbar switches views, pass the intro for the view
   * that's showing.
   */
  intro?: ReactNode;
  /** The controls over the list: a view switch, filters, a search. */
  toolbar?: ReactNode;
  /** Whether there's nothing to list, so `empty` shows in place of the list. */
  isEmpty?: boolean;
  /** What shows when `isEmpty`, e.g. an `EmptyState`. */
  empty?: ReactNode;
  /** The list itself. Split into groups with `ListGroup`, in a `Stack gap="xl"`. */
  children?: ReactNode;
  /** Sections that follow the list, e.g. suggestions of what to add, each under a default `SectionHeading`. */
  after?: ReactNode;
}

/**
 * The shape of a page that lists things, in one order every list page shares:
 * header, a notice, an optional intro, the toolbar, then the list (or what
 * to show when it's empty), then anything that follows it. Search, sort and
 * filters go in `toolbar`, never in a heading or the header's actions; the
 * list doesn't count its rows, since they're there to see. Modals sit beside it, not in it. Everything
 * arrives through slots, so the intro can never land between the filters
 * and the list they filter.
 */
export default function ListPage({ header, notice, intro, toolbar, isEmpty = false, empty, children, after }: Props) {
  return (
    <Stack gap="xl">
      {header}
      {notice}
      {intro}
      <Stack gap="md">
        {toolbar}
        {isEmpty ? empty : children}
      </Stack>
      {after}
    </Stack>
  );
}
