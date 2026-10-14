import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import IconButton from "../IconButton";

interface Props {
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
  /** The manual run panel is a fixed 600px tall. */
  fixedHeight?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  "data-testid"?: string;
  /** Inventory id for the annotations panel. */
  annotation?: string;
}

/**
 * The floating card every inspector uses (collaborative-editor/components/
 * inspector/InspectorLayout.tsx): w-screen max-w-md with p-6 around a white
 * rounded card, title + close X, scrolling body and an optional footer.
 */
export default function InspectorLayout({
  title,
  onClose,
  footer,
  children,
  fixedHeight = false,
  showBackButton = false,
  onBack,
  "data-testid": testId,
  annotation = "workflow-editor-inspectors",
}: Props) {
  return (
    <div
      className="pointer-events-auto flex h-full max-h-[calc(100vh-5rem)] w-screen max-w-md items-start justify-end p-6"
      data-testid={testId}
      data-annotation={annotation}
    >
      <div className={cn("relative flex min-h-0 w-full flex-col rounded-lg bg-white shadow-sm", fixedHeight ? "h-[600px]" : "max-h-[calc(100vh-8rem)]")}>
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            {showBackButton && <IconButton icon="hero-arrow-left" label="Back" size="sm" onClick={onBack ?? onClose} />}
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          </div>
          <IconButton icon="hero-x-mark" label="Close panel" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-gray-200 px-6 py-4" data-testid="inspector-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Left and right button slots for an inspector footer (InspectorFooter.tsx). */
export function InspectorFooter({ leftButtons, rightButtons }: { leftButtons?: ReactNode; rightButtons?: ReactNode }) {
  if (!leftButtons && !rightButtons) return null;
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">{leftButtons}</div>
      <div className="flex gap-2">{rightButtons}</div>
    </div>
  );
}
