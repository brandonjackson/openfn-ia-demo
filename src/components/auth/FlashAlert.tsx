import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export type FlashKind = "info" | "warning" | "danger";

// Lightning's phx.new `.alert` classes (assets/css/app.css).
const kindClasses: Record<FlashKind, string> = {
  info: "text-primary-800 bg-primary-100 border-primary-200",
  warning: "text-[#8b5f0d] bg-[#fcf8e3] border-[#faebcc]",
  danger: "text-[#dc2626] bg-[#fdebeb] border-[#fdebeb]",
};

/** The old-style flash box controller views print above a form (`alert alert-danger`). */
export default function FlashAlert({ kind, children }: { kind: FlashKind; children: ReactNode }) {
  return (
    <div role="alert" className={cn("p-[15px] mb-5 border border-transparent rounded", kindClasses[kind])}>
      {children}
    </div>
  );
}
