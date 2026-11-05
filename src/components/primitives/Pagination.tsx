import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

interface Props {
  /** The page showing, from 1. */
  page: number;
  /** How many rows a page holds. */
  pageSize: number;
  /** How many rows there are across every page. */
  total: number;
  /** What the rows are, for the summary, e.g. "events". */
  noun?: string;
  onChange: (page: number) => void;
}

/**
 * Previous and next under a long list or table, with where you are in it:
 * "Showing 11–20 of 26 events". Draws nothing when everything fits on one page.
 */
export default function Pagination({ page, pageSize, total, noun = "results", onChange }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-gray-500">
        Showing {first}–{last} of {total} {noun}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="xs" icon={ChevronLeft} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <span className="text-xs text-gray-500" aria-current="page">
          Page {page} of {pageCount}
        </span>
        <Button
          variant="secondary"
          size="xs"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight size={14} />
        </Button>
      </div>
    </nav>
  );
}
