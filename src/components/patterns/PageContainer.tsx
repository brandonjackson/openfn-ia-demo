import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

/**
 * Centred content column for every page outside the workflow editor,
 * capped at 1024px so wide screens keep a readable line length.
 */
export default function PageContainer({ children }: Props) {
  return <div className="mx-auto w-full max-w-5xl">{children}</div>;
}
