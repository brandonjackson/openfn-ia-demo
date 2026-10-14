import type { ReactNode } from "react";
import Card from "../Card";

/**
 * A /profile section: a padded Card with a title, description and the
 * section's control on the right, tagged with its INVENTORY.md id.
 */
export default function ProfileCard({
  annotation,
  title,
  description,
  action,
  children,
}: {
  /** INVENTORY.md id shown by the annotations panel on hover. */
  annotation: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div data-annotation={annotation}>
      <Card padding="lg" title={title} description={description} action={action}>
        {children}
      </Card>
    </div>
  );
}
