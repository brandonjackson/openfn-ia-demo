import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CalloutVariant = "info" | "warning" | "danger" | "success";

const styles: Record<CalloutVariant, { box: string; icon: string; title: string; body: string; Icon: LucideIcon }> = {
  info: { box: "border border-blue-200 bg-blue-50", icon: "text-blue-500", title: "text-blue-800", body: "text-blue-700", Icon: Info },
  warning: { box: "border border-amber-200 bg-amber-50", icon: "text-amber-500", title: "text-amber-800", body: "text-amber-700", Icon: Info },
  danger: { box: "border-2 border-red-200 bg-red-50", icon: "text-red-500", title: "text-red-700", body: "text-red-600", Icon: AlertTriangle },
  success: { box: "border border-green-200 bg-green-50", icon: "text-green-500", title: "text-green-800", body: "text-green-700", Icon: CheckCircle2 },
};

interface Props {
  variant?: CalloutVariant;
  title: string;
  /** Overrides the variant's default icon. */
  icon?: LucideIcon;
  children?: ReactNode;
}

/**
 * Highlighted message box: notices, warnings and danger zones.
 */
export default function Callout({ variant = "info", title, icon, children }: Props) {
  const s = styles[variant];
  const Icon = icon ?? s.Icon;
  return (
    <div data-ui="callout" data-tone={variant} className={`rounded-lg px-5 py-4 ${s.box}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className={`flex-shrink-0 mt-0.5 ${s.icon}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${s.title}`}>{title}</h3>
          {children && <div className={`mt-1 text-sm space-y-3 ${s.body}`}>{children}</div>}
        </div>
      </div>
    </div>
  );
}
