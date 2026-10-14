import type { ReactNode } from "react";

function ControlButton({
  onClick,
  title,
  disabled,
  children,
  testId,
}: {
  onClick?: () => void;
  title: string;
  disabled?: boolean;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      data-testid={testId}
      className="flex items-center justify-center w-[26px] h-[26px] p-1 bg-[#fefefe] border-b border-[#eee] hover:bg-[#f4f4f4] disabled:pointer-events-none cursor-pointer"
    >
      {children}
    </button>
  );
}

interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  isManualLayout: boolean;
  onToggleLayout: () => void;
  onAutoLayout: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

/**
 * The canvas's bottom-left control stack (xyflow `<Controls>` as configured
 * in collaborative-editor/components/diagram/WorkflowDiagram.tsx): zoom in,
 * zoom out, fit view, manual/auto layout, run auto layout, undo, redo.
 */
export default function DiagramControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  isManualLayout,
  onToggleLayout,
  onAutoLayout,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: Props) {
  return (
    <div
      className="absolute left-[15px] bottom-[15px] z-[5] flex flex-col shadow-[0_0_2px_1px_rgba(0,0,0,0.08)]"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <ControlButton onClick={onZoomIn} title="Zoom In">
        <svg viewBox="0 0 32 32" className="w-3 h-3 fill-current text-black">
          <path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" />
        </svg>
      </ControlButton>
      <ControlButton onClick={onZoomOut} title="Zoom Out">
        <svg viewBox="0 0 32 5" className="w-3 h-3 fill-current text-black">
          <path d="M0 0h32v4.2H0z" />
        </svg>
      </ControlButton>
      <ControlButton onClick={onFitView} title="Fit view">
        <span className="text-black hero-viewfinder-circle w-4 h-4" />
      </ControlButton>
      <ControlButton
        onClick={onToggleLayout}
        title={isManualLayout ? "Switch to auto layout mode" : "Switch to manual layout mode"}
      >
        <span
          className={`text-black w-4 h-4 ${isManualLayout ? "hero-cursor-arrow-rays" : "hero-cursor-arrow-ripple"}`}
        />
      </ControlButton>
      <ControlButton onClick={onAutoLayout} title="Run auto layout (override manual positions)">
        <span className="text-black hero-squares-2x2 w-4 h-4" />
      </ControlButton>
      <ControlButton onClick={onUndo} disabled={!canUndo} title={canUndo ? "Undo" : "Nothing to undo"} testId="undo-button">
        <span className="text-black hero-arrow-uturn-left w-4 h-4" />
      </ControlButton>
      <ControlButton onClick={onRedo} disabled={!canRedo} title={canRedo ? "Redo" : "Nothing to redo"} testId="redo-button">
        <span className="text-black hero-arrow-uturn-right w-4 h-4" />
      </ControlButton>
    </div>
  );
}
