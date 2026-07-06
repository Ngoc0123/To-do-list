import { StatusFilter, TaskDateFilter } from "@/services/tasks";
import { Project, TaskPriority } from "@/types";

export const priorityStyles: Record<TaskPriority, string> = {
  HIGH: "border-[#efb2a5] bg-[#f7ded8] text-[#b84025]",
  MEDIUM: "border-[#e5c98f] bg-[#f7e8bd] text-[#91630f]",
  LOW: "border-[#d9d0c3] bg-[#e8e0d5] text-[#7f715f]"
};

export function isTaskOverdue(value: string | null, completed: boolean) {
  if (completed || !value) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
}

export function formatDate(value: string | null, completed: boolean) {
  if (completed) {
    return "Completed";
  }
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(date, today)) {
    return `Today, ${date.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}`;
  }
  if (sameDay(date, tomorrow)) {
    return "Tomorrow";
  }

  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function getEmptyTaskMessage({
  totalElements,
  search,
  selectedProject,
  statusFilter,
  dateFilter,
  statusMessage
}: {
  totalElements: number;
  search: string;
  selectedProject: Project | null;
  statusFilter: StatusFilter;
  dateFilter: TaskDateFilter | null;
  statusMessage: string;
}) {
  if (statusMessage && statusMessage !== "No matching tasks found.") {
    return {
      title: "Tasks could not load",
      message: statusMessage
    };
  }

  if (search) {
    return {
      title: "No tasks match your search",
      message: `No ${statusFilter.toLowerCase()} tasks found for "${search}".`
    };
  }

  if (selectedProject) {
    return {
      title: `No ${statusFilter.toLowerCase()} tasks in ${selectedProject.name}`,
      message: "This project does not have tasks matching the current view."
    };
  }

  if (dateFilter) {
    const emptyDateTitle =
      dateFilter === "TODAY"
        ? "Nothing due today"
        : dateFilter === "NEXT_WEEK"
          ? "Nothing due next week"
          : "No tasks without due dates";

    return {
      title: emptyDateTitle,
      message: "Change the due-date filter to see more tasks."
    };
  }

  if (totalElements === 0) {
    return {
      title: "No tasks yet",
      message: "Add your first task to start tracking what needs attention."
    };
  }

  return {
    title: statusFilter === "COMPLETED" ? "No completed tasks yet" : "No active tasks right now",
    message:
      statusFilter === "COMPLETED"
        ? "Completed tasks will appear here once you check them off."
        : "Add a task or switch views to review completed work."
  };
}
