import { Menu } from "lucide-react";
import IconButton from "./IconButton";
import InstanceLogo from "./InstanceLogo";

interface Props {
  /** Opens the sidebar, which slides in from the left. */
  onOpenMenu: () => void;
}

/**
 * The bar across the top of small screens, where the sidebar is hidden: a
 * menu button that slides the sidebar in, and the instance logo. Hidden from
 * the `md` breakpoint up, where the sidebar is always showing.
 */
export default function MobileTopBar({ onOpenMenu }: Props) {
  return (
    <header
      data-ui="mobile-top-bar"
      className="md:hidden flex items-center gap-2 px-2 py-2 border-b border-gray-200 bg-white flex-shrink-0"
    >
      <IconButton icon={Menu} label="Open menu" size="md" onClick={onOpenMenu} />
      <InstanceLogo />
    </header>
  );
}
