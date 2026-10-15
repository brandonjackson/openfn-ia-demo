import IconButton from "../IconButton";

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
      className="absolute bottom-4 left-4 z-5 flex flex-col divide-y divide-gray-100 rounded-md bg-white shadow-sm *:rounded-none"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <IconButton icon="hero-plus" label="Zoom In" onClick={onZoomIn} />
      <IconButton icon="hero-minus" label="Zoom Out" onClick={onZoomOut} />
      <IconButton icon="hero-viewfinder-circle" label="Fit view" onClick={onFitView} />
      <IconButton
        icon={isManualLayout ? "hero-cursor-arrow-rays" : "hero-cursor-arrow-ripple"}
        label={isManualLayout ? "Switch to auto layout mode" : "Switch to manual layout mode"}
        onClick={onToggleLayout}
      />
      <IconButton icon="hero-squares-2x2" label="Run auto layout (override manual positions)" onClick={onAutoLayout} />
      <IconButton icon="hero-arrow-uturn-left" label={canUndo ? "Undo" : "Nothing to undo"} disabled={!canUndo} onClick={onUndo} data-testid="undo-button" />
      <IconButton icon="hero-arrow-uturn-right" label={canRedo ? "Redo" : "Nothing to redo"} disabled={!canRedo} onClick={onRedo} data-testid="redo-button" />
    </div>
  );
}
