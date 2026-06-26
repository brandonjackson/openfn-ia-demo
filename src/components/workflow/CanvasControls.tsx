import { Plus, Minus, Maximize, Crosshair, LayoutGrid, Undo2, Redo2 } from "lucide-react";

/**
 * The vertical zoom / fit / layout control stack pinned to the bottom-left of
 * the canvas. Buttons are non-functional placeholders for the prototype.
 */
export default function CanvasControls({
  onZoomIn,
  onZoomOut,
}: {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}) {
  const buttons: { icon: React.ElementType; title: string; onClick?: () => void }[] = [
    { icon: Plus, title: "Zoom in", onClick: onZoomIn },
    { icon: Minus, title: "Zoom out", onClick: onZoomOut },
    { icon: Maximize, title: "Fit to view" },
    { icon: Crosshair, title: "Center" },
    { icon: LayoutGrid, title: "Auto layout" },
    { icon: Undo2, title: "Undo" },
    { icon: Redo2, title: "Redo" },
  ];

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      {buttons.map(({ icon: Icon, title, onClick }) => (
        <button
          key={title}
          type="button"
          title={title}
          onClick={onClick}
          className="p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 border-b border-gray-100 last:border-b-0"
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
