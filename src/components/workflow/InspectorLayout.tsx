import type { ReactNode } from "react";
import EditorButton from "./EditorButton";

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
      className="pointer-events-auto w-screen max-w-md flex items-start justify-end p-6"
      style={{ height: "100%", maxHeight: "calc(100vh - 5rem)" }}
      data-testid={testId}
      data-annotation={annotation}
    >
      <div
        className={`relative flex flex-col bg-white shadow-sm rounded-lg w-full ${fixedHeight ? "h-[600px]" : ""}`}
        style={{ maxHeight: fixedHeight ? undefined : "calc(100vh - 8rem)", minHeight: 0 }}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <button
                  type="button"
                  onClick={onBack ?? onClose}
                  className="flex items-center justify-center hover:text-gray-500 cursor-pointer text-gray-900"
                >
                  <span className="hero-arrow-left h-4 w-4 inline-block" />
                  <span className="sr-only">Back</span>
                </button>
              )}
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            </div>
            <div className="ml-3 flex h-7 items-center">
              <EditorButton variant="nakedClose" onClick={onClose} />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-gray-200" data-testid="inspector-footer">
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
    <div className="flex justify-between items-center">
      <div className="flex gap-2">{leftButtons}</div>
      <div className="flex gap-2">{rightButtons}</div>
    </div>
  );
}
