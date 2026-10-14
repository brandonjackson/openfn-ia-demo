import type { ReactNode } from "react";

/** A white card on the health page with a small title and optional meta (WorkflowHealth.tsx `Card`). */
export default function HealthCard({ title, meta, children }: { title: string; meta?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-medium text-gray-900">{title}</h2>
        {meta && <span className="text-xs text-gray-500">{meta}</span>}
      </div>
      {children}
    </div>
  );
}
