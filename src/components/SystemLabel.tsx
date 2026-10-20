import { Link } from "react-router-dom";
import AdaptorLogo from "./AdaptorLogo";

interface Props {
  name: string;
  /** Adaptor id; looked up from the name when not given. */
  adaptor?: string;
  /** Makes the name a link, e.g. to the system's page. */
  to?: string;
}

/**
 * A system's logo and name inline, for table cells and meta lines.
 */
export default function SystemLabel({ name, adaptor, to }: Props) {
  const content = (
    <>
      <AdaptorLogo adaptor={adaptor} name={name} size="2xs" />
      {name}
    </>
  );
  return to ? (
    <Link to={to} className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline">
      {content}
    </Link>
  ) : (
    <span className="inline-flex items-center gap-1.5">{content}</span>
  );
}
