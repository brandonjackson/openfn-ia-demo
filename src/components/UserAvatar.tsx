import { cn } from "../utils/cn";

interface Props {
  firstName: string;
  lastName?: string | null;
  size?: "xs" | "sm";
  className?: string;
}

/** Initials in a gray circle (Lightning's `user_avatar`). */
export default function UserAvatar({ firstName, lastName, size = "xs", className }: Props) {
  const initials = (firstName.charAt(0) + (lastName ? lastName.charAt(0) : "")).toUpperCase();
  return (
    <div
      className={cn(
        "rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-500",
        size === "xs" ? "h-5 w-5 text-[10px]" : "h-8 w-8 text-sm",
        className
      )}
    >
      {initials}
    </div>
  );
}
