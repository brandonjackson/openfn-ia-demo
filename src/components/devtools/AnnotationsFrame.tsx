import type { ReactNode } from "react";
import { useAnnotations } from "../../annotations/annotations-context";
import { ANNOTATIONS_PANEL_WIDTH } from "./AnnotationsPanel";

/** Wraps the app and makes room on the right for the annotations panel when it's open. */
export default function AnnotationsFrame({ children }: { children: ReactNode }) {
  const { open } = useAnnotations();
  return <div style={{ marginRight: open ? ANNOTATIONS_PANEL_WIDTH : 0 }}>{children}</div>;
}
