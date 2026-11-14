interface Props {
  /** Whose mark it is: the organisation you're in or, without Organizations, the instance. Its logo (a URL or data URL) shows when it has one, its initials otherwise. */
  instance: { initials: string; logo?: string };
}

/**
 * The organisation's logo, or its initials on a square without one: the one
 * way the app draws whose corner you're in. Tops the sidebar beside its name
 * (`InstanceLogo`) and starts the account menu at its foot (`AccountMenu`),
 * so the two always match. The initials sit on the same dark grey square as
 * Organization settings' preview of them.
 */
export default function InstanceMark({ instance }: Props) {
  return instance.logo ? (
    <img src={instance.logo} alt="" className="h-7 w-7 flex-shrink-0 rounded-md border border-gray-200 bg-white object-contain" />
  ) : (
    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gray-600 text-[11px] font-semibold leading-none text-white">
      {instance.initials}
    </span>
  );
}
