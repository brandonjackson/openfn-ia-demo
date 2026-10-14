/** Lightning's custom "branches" icon (live/components/icon.ex), used for Merge. */
export default function BranchesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="2.25" />
      <circle cx="18" cy="6" r="2.25" />
      <circle cx="18" cy="18" r="2.25" />
      <path d="M6 8v10a4 4 0 0 0 4 4h8" />
      <path d="M8 6h8" />
    </svg>
  );
}
