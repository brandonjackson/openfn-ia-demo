import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  to: string;
  children: ReactNode;
  /** "default" for names in tables; "action" for "View all"-style links. */
  variant?: "default" | "action";
}

/** An inline in-app link: record names in tables, or a small "view more" action. */
export default function TextLink({ to, children, variant = "default" }: Props) {
  return (
    <Link
      to={to}
      className={
        variant === "action"
          ? "text-sm font-medium text-indigo-600 hover:text-indigo-800"
          : "font-medium text-gray-900 hover:text-indigo-600 hover:underline"
      }
    >
      {children}
    </Link>
  );
}
