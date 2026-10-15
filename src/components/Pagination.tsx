import type { ReactNode } from "react";
import { cn } from "../utils/cn";

interface Props {
  pageNumber: number;
  pageSize: number;
  totalEntries: number;
  onPage?: (page: number) => void;
  /** Extra controls after the count, e.g. the export button on History. */
  actions?: ReactNode;
}

const edge =
  "relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50";

/** Footer bar for paginated tables (Lightning's `Pagination.pagination_bar`). */
export default function Pagination({ pageNumber, pageSize, totalEntries, onPage, actions }: Props) {
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const from = pageNumber * pageSize - pageSize + 1;
  const to = Math.min(pageNumber * pageSize, totalEntries);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div data-ui="pagination" className="bg-white px-4 py-3 flex items-center justify-between sm:px-6 rounded-b-lg">
      <div className="flex items-center space-x-4">
        <p className="text-sm text-gray-700">
          {totalEntries === 0 ? (
            "No results found"
          ) : (
            <>
              Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of{" "}
              <span className="font-medium">{totalEntries}</span> total results
            </>
          )}
        </p>
        {actions && <div className="flex items-center">{actions}</div>}
      </div>
      <nav className="relative z-0 inline-flex rounded-md shadow-xs -space-x-px" aria-label="Pagination">
        {pageNumber > 1 && (
          <button type="button" onClick={() => onPage?.(pageNumber - 1)} className={cn(edge, "rounded-l-md")}>
            <span className="sr-only">Previous</span>
            <span className="hero-chevron-left h-5 w-5" />
          </button>
        )}
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPage?.(n)}
            aria-current={n === pageNumber ? "page" : undefined}
            data-ui="pagination-page"
            className={cn(
              "relative inline-flex items-center px-4 py-2 border text-sm font-medium",
              n === pageNumber
                ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
            )}
          >
            {n}
          </button>
        ))}
        {pageNumber < totalPages && (
          <button type="button" onClick={() => onPage?.(pageNumber + 1)} className={cn(edge, "rounded-r-md")}>
            <span className="sr-only">Next</span>
            <span className="hero-chevron-right h-5 w-5" />
          </button>
        )}
      </nav>
    </div>
  );
}
