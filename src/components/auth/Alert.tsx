import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export type AlertType = "info" | "success" | "warning" | "danger";

// Lightning's Common.alert (live/components/common.ex `alert_classes`, `select_icon`).
const styles: Record<AlertType, { bg: string; icon: string; iconName: string; text: string }> = {
  success: { bg: "bg-green-50", icon: "text-green-400", iconName: "hero-check-circle-solid", text: "text-green-700" },
  warning: { bg: "bg-yellow-50", icon: "text-yellow-400", iconName: "hero-exclamation-triangle", text: "text-yellow-700" },
  danger: { bg: "bg-red-50", icon: "text-red-400", iconName: "hero-x-circle-solid", text: "text-red-700" },
  info: { bg: "bg-blue-50", icon: "text-blue-400", iconName: "hero-information-circle-solid", text: "text-blue-700" },
};

/** An icon + message alert box (Lightning's `Common.alert`, without header or actions). */
export default function Alert({ type, id, children }: { type: AlertType; id?: string; children: ReactNode }) {
  const s = styles[type];
  return (
    <div id={id} className={cn("rounded-md p-4 text-wrap", s.bg)}>
      <div className="flex items-center">
        <div className="shrink-0">
          <span className={cn(s.iconName, "block h-5 w-5", s.icon)} />
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <div className={cn("text-sm", s.text)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
