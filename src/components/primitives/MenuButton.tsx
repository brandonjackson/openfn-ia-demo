import { ArrowRight, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Button from "./Button";
import type { ButtonSize, ButtonVariant } from "./Button";
import DropdownMenu from "./DropdownMenu";
import type { DropdownMenuItem } from "./DropdownMenu";
import TextLink from "./TextLink";

export type MenuButtonItem = Pick<DropdownMenuItem, "id" | "label" | "description" | "icon">;

interface Props {
  label: string;
  /** Icon shown before the label. */
  icon?: LucideIcon;
  /**
   * `button` renders a {@link Button}; `link` renders a small indigo text link,
   * for actions that sit inside a card.
   */
  appearance?: "button" | "link";
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Small grey heading at the top of the menu, e.g. "Start it in…". */
  menuTitle?: string;
  items: MenuButtonItem[];
  onSelect: (id: string) => void;
  /** Which edge of the trigger the menu lines up with. */
  align?: "left" | "right";
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}

/**
 * A button or text link that opens a short menu of choices, e.g. which kind of
 * component to create or which project to start a workflow in.
 */
export default function MenuButton({
  label,
  icon,
  appearance = "button",
  variant = "primary",
  size = "sm",
  menuTitle,
  items,
  onSelect,
  align = "left",
  defaultOpen = false,
}: Props) {
  const LinkIcon = icon;
  return (
    <DropdownMenu
      ariaLabel={label}
      title={menuTitle}
      items={items}
      onSelect={onSelect}
      align={align}
      widthClass="w-72"
      defaultOpen={defaultOpen}
      trigger={({ open, toggle }) =>
        appearance === "button" ? (
          <Button variant={variant} size={size} icon={icon} aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
            {label}
            <ChevronDown size={14} className="-mr-0.5 opacity-70" />
          </Button>
        ) : (
          <TextLink variant="action" onClick={toggle}>
            {LinkIcon && <LinkIcon size={12} />}
            {label}
            <ArrowRight size={12} />
          </TextLink>
        )
      }
    />
  );
}
