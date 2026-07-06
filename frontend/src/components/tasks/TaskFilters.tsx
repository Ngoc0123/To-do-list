import { Search } from "lucide-react";
import { StatusFilter, TaskDateFilter, TaskSort } from "@/services/tasks";

type TaskFiltersProps = {
  search: string;
  statusFilter: StatusFilter;
  dateFilter: TaskDateFilter | null;
  sort: TaskSort;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onDateFilterChange: (filter: TaskDateFilter | null) => void;
  onSortChange: (sort: TaskSort) => void;
};

export function TaskFilters({
  search,
  statusFilter,
  dateFilter,
  sort,
  onSearchChange,
  onStatusFilterChange,
  onDateFilterChange,
  onSortChange
}: TaskFiltersProps) {
  return (
    <div className="mt-10">
      <div className="flex h-7 gap-8 border-[#ddd5c8]">
        {[
          ["ACTIVE", "Active"],
          ["COMPLETED", "Completed"]
        ].map(([value, label]) => {
          const isSelected = statusFilter === value;
          const selectedClass = value === "COMPLETED" ? "font-bold text-[#22c55e]" : "font-semibold text-[#c0503a]";
          const underlineClass = isSelected
            ? value === "COMPLETED"
              ? "bg-[#22c55e]"
              : "bg-[#c0503a]"
            : "bg-[#ddd5c8]";

          return (
            <button
              key={value}
              type="button"
              onClick={() => onStatusFilterChange(value as StatusFilter)}
              className={`relative text-sm ${isSelected ? selectedClass : "font-medium text-[#a8917e]"}`}
            >
              {label}
              <span className={`absolute -bottom-2 left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-full ${underlineClass}`} />
            </button>
          );
        })}
      </div>

      {statusFilter !== "COMPLETED" && (
        <>
          <label className="relative mt-7 block">
            <Search aria-hidden size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a89880]" />
            <input
              type="search"
              placeholder="Search tasks..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-11 w-full rounded-md border border-[#d9d0c3] bg-[#ede8df] pl-10 pr-4 text-sm text-[#2c1a0e] outline-none placeholder:text-[#a89880] focus:border-[#b84025]"
            />
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {[
              ["TODAY", "Today"],
              ["NEXT_WEEK", "Next Week"],
              ["NO_DUE_DATE", "No Due Date"]
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onDateFilterChange(dateFilter === value ? null : (value as TaskDateFilter))}
                className={`h-8 rounded px-4 text-xs font-semibold transition ${
                  dateFilter === value
                    ? "bg-[#b84025] text-white"
                    : "border border-[#d9d0c3] bg-[#ede8df] text-[#4a3728] hover:border-[#b84025]"
                }`}
              >
                {label}
              </button>
            ))}

            <label className="ml-auto flex h-8 items-center gap-2 rounded border border-[#d9d0c3] bg-[#ede8df] pl-3 pr-2 text-xs font-semibold text-[#7f715f]">
              <span>Sort</span>
              <select
                value={sort}
                onChange={(event) => onSortChange(event.target.value as TaskSort)}
                className="h-full bg-transparent text-[#4a3728] outline-none"
                aria-label="Sort tasks by due date"
              >
                <option value="dueDate,asc">Due soon</option>
                <option value="dueDate,desc">Due later</option>
              </select>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
