import type { ReactNode } from "react";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  /** The top of the page, e.g. a `PageHeader` with its breadcrumbs and actions. */
  header: ReactNode;
  /**
   * What the list is for, above the toolbar: a feature intro or a row of
   * cards. Optional, since most of the time it's hidden. When the toolbar
   * switches views, pass the intro for the view that's showing.
   */
  intro?: ReactNode;
  /** The controls over the list: a view switch, filters, a search. */
  toolbar?: ReactNode;
  /** A short line under the toolbar on what the list holds, e.g. "5 services". */
  summary?: ReactNode;
  /** Whether there's nothing to list, so `empty` shows in place of the list. */
  isEmpty?: boolean;
  /** What shows when `isEmpty`, e.g. an `EmptyState`. */
  empty?: ReactNode;
  /** The list itself. */
  children?: ReactNode;
  /** Sections that follow the list, e.g. suggestions of what to add. */
  after?: ReactNode;
}

/**
 * The shape of a page that lists things, in one order every list page shares:
 * header, an optional intro, the toolbar, a summary line, then the list (or
 * what to show when it's empty), then anything that follows it. Everything
 * arrives through slots, so the intro can never land between the filters
 * and the list they filter.
 */
export default function ListPage({ header, intro, toolbar, summary, isEmpty = false, empty, children, after }: Props) {
  return (
    <Stack gap="xl">
      {header}
      {intro}
      <Stack gap="md">
        {toolbar}
        {summary && (
          <Text tone="subtle" size="xs" block role="status">
            {summary}
          </Text>
        )}
        {isEmpty ? empty : children}
      </Stack>
      {after}
    </Stack>
  );
}
