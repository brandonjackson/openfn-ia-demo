import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import Card from "../Card";
import Heading from "../Heading";
import IconButton from "../IconButton";

interface Props {
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
  /** The manual run panel is a fixed 600px tall. */
  fixedHeight?: boolean;
  /** Children fill the body edge to edge instead of sitting in a padded stack. */
  bare?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  "data-testid"?: string;
  /** Inventory id for the annotations panel. */
  annotation?: string;
}

/**
 * The floating card every inspector uses (collaborative-editor/components/
 * inspector/InspectorLayout.tsx): w-screen max-w-md with p-6 around a white
 * card, title + close X, scrolling body and an optional footer.
 */
export default function InspectorLayout({
  title,
  onClose,
  footer,
  children,
  fixedHeight = false,
  bare = false,
  showBackButton = false,
  onBack,
  "data-testid": testId,
  annotation = "workflow-editor-inspectors",
}: Props) {
  return (
    <div className="pointer-events-auto w-screen max-w-md p-6" data-testid={testId} data-annotation={annotation}>
      <Card padding="none" className={cn("flex flex-col", fixedHeight ? "h-150" : "max-h-[calc(100vh-8rem)]")}>
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            {showBackButton && <IconButton icon="hero-arrow-left" label="Back" size="sm" onClick={onBack ?? onClose} />}
            <Heading as="h2">{title}</Heading>
          </div>
          <IconButton icon="hero-x-mark" label="Close panel" onClick={onClose} />
        </div>
        <div className={cn("flex-1 overflow-y-auto", !bare && "space-y-6 p-6")}>{children}</div>
        {footer && (
          <div className="border-t border-gray-200 px-6 py-4" data-testid="inspector-footer">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}

/** Left and right button slots for an inspector footer (InspectorFooter.tsx). */
export function InspectorFooter({ leftButtons, rightButtons }: { leftButtons?: ReactNode; rightButtons?: ReactNode }) {
  if (!leftButtons && !rightButtons) return null;
  return (
    <div className="flex items-center justify-between *:flex *:gap-2">
      <div>{leftButtons}</div>
      <div>{rightButtons}</div>
    </div>
  );
}
