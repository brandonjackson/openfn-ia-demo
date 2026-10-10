import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  to: string;
  children: ReactNode;
  /**
   * "default" for names in tables; "action" for "View all"-style links;
   * "inline" for links inside running prose.
   */
  variant?: "default" | "action" | "inline";
}

const variantClasses = {
  default: "font-medium text-gray-900 hover:text-indigo-600 hover:underline",
  action: "text-sm font-medium text-indigo-600 hover:text-indigo-800",
  inline: "text-indigo-600 hover:text-indigo-800 hover:underline",
};

/** An in-app link: record names in tables, a "view more" action, or a link in prose. */
export default function TextLink({ to, children, variant = "default" }: Props) {
  return (
    <Link to={to} className={variantClasses[variant]}>
      {children}
    </Link>
  );
}
