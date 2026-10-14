import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export type AlertType = "info" | "success" | "warning" | "danger";

// Lightning's Common.alert_classes/1, written out in full for Tailwind.
const classes: Record<AlertType, { bg: string; icon: string; header: string; text: string; iconName: string }> = {
  success: {
    bg: "bg-green-50",
    icon: "text-green-400",
    header: "text-green-800",
    text: "text-green-700",
    iconName: "hero-check-circle-solid",
  },
  warning: {
    bg: "bg-yellow-50",
    icon: "text-yellow-400",
    header: "text-yellow-800",
    text: "text-yellow-700",
    iconName: "hero-exclamation-triangle",
  },
  danger: {
    bg: "bg-red-50",
    icon: "text-red-400",
    header: "text-red-800",
    text: "text-red-700",
    iconName: "hero-x-circle-solid",
  },
  info: {
    bg: "bg-blue-50",
    icon: "text-blue-400",
    header: "text-blue-800",
    text: "text-blue-700",
    iconName: "hero-information-circle-solid",
  },
};

interface Props {
  type: AlertType;
  header?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Lightning's `Common.alert` (live/components/common.ex): a tinted,
 * rounded box with a type icon, an optional header and a message.
 */
export default function Alert({ type, header, children, className, id }: Props) {
  const c = classes[type];
  return (
    <div id={id} className={cn("rounded-md p-4 text-wrap", c.bg, className)} data-ui="alert" data-variant={type}>
      <div className={cn("flex", header ? "items-start" : "items-center")}>
        <div className="shrink-0">
          <span className={cn(c.iconName, "block h-5 w-5", c.icon)} />
        </div>
        <div className="ml-3 min-w-0 flex-1">
          {header ? (
            <>
              <h3 className={cn("text-sm font-medium", c.header)}>{header}</h3>
              <div className={cn("mt-2 text-sm", c.text)}>{children}</div>
            </>
          ) : (
            <div className={cn("text-sm", c.text)}>{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
