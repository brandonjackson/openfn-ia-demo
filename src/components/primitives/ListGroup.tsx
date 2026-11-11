import type { ReactNode } from "react";
import SectionHeading from "./SectionHeading";
import Stack from "./Stack";

interface Props {
  /** What the rows have in common, e.g. who offers them or what kind they are. */
  title: string;
  /** How many rows the group holds, shown quietly after the title. */
  count?: number;
  /** A line on what the group is. */
  description?: string;
  /** A control beside the heading, usually a small Button. */
  action?: ReactNode;
  /** The rows. Wrap them in one element (a `Card flush`, say) to draw them as one block. */
  children?: ReactNode;
}

/**
 * One group of rows inside a list, under a small uppercase heading. Every list
 * page groups its rows this way, so the headings look the same wherever a list
 * is split up. Put groups in a `Stack gap="xl"`.
 */
export default function ListGroup({ title, count, description, action, children }: Props) {
  return (
    <section aria-label={title}>
      <SectionHeading variant="label" title={title} count={count} description={description} action={action} />
      <Stack gap="sm">{children}</Stack>
    </section>
  );
}
