import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getVisiblePages(page: number, totalPages: number) {
  const pages = new Set([0, totalPages - 1, page - 1, page, page + 1]);

  return Array.from(pages)
    .filter((pageNumber) => pageNumber >= 0 && pageNumber < totalPages)
    .sort((a, b) => a - b);
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav
      className="mt-6 flex flex-col gap-3 rounded-md border border-[#d9d0c3] bg-[#ede8df] p-2 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Task pagination"
    >
      <p className="px-2 text-xs font-semibold uppercase text-[#a89880]">
        Page {page + 1} of {totalPages}
      </p>

      <div className="grid grid-cols-[36px_1fr_36px] items-center gap-2 sm:flex">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPageChange(Math.max(page - 1, 0))}
          className="flex h-9 w-9 items-center justify-center rounded border border-[#d9d0c3] bg-[#f2ede4] text-[#4a3728] transition hover:border-[#b84025] hover:text-[#b84025] disabled:cursor-not-allowed disabled:border-[#ddd5c8] disabled:text-[#c2b4a4]"
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft aria-hidden size={17} />
        </button>

        <div className="flex min-w-0 justify-center gap-1 rounded border border-[#d9d0c3] bg-[#f2ede4] p-1 sm:min-w-[196px]">
          {visiblePages.map((pageNumber, index) => {
            const hasGap = index > 0 && pageNumber - visiblePages[index - 1] > 1;
            const isCurrent = pageNumber === page;

            return (
              <div key={pageNumber} className="flex items-center gap-1">
                {hasGap && <span className="px-1 text-xs font-semibold text-[#a89880]">...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(pageNumber)}
                  aria-label={`Go to page ${pageNumber + 1}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`h-7 min-w-7 rounded px-2 text-xs font-semibold transition ${
                    isCurrent ? "bg-[#b84025] text-white shadow-sm" : "text-[#7f715f] hover:bg-[#ede8df] hover:text-[#2c1a0e]"
                  }`}
                >
                  {pageNumber + 1}
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(Math.min(page + 1, totalPages - 1))}
          className="flex h-9 w-9 items-center justify-center rounded border border-[#d9d0c3] bg-[#f2ede4] text-[#4a3728] transition hover:border-[#b84025] hover:text-[#b84025] disabled:cursor-not-allowed disabled:border-[#ddd5c8] disabled:text-[#c2b4a4]"
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight aria-hidden size={17} />
        </button>
      </div>
    </nav>
  );
}
