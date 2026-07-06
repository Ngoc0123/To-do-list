import { AlertCircle, Calendar, Check, Pencil, Trash2 } from "lucide-react";
import { Task } from "@/types";
import { formatDate, isTaskOverdue, priorityStyles } from "./taskDisplay";

type TaskRowProps = {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

export function TaskRow({ task, onToggle, onEdit, onDelete }: TaskRowProps) {
  const isOverdue = isTaskOverdue(task.dueDate, task.isCompleted);

  if (task.isCompleted) {
    return (
      <article className="grid min-h-[50px] grid-cols-[auto_1fr] items-center gap-4 rounded-[10px] border border-[#ddd5c8] bg-[#f7f2eb] p-4">
        <button
          type="button"
          aria-label="Mark as active"
          onClick={() => onToggle(task.id)}
          className="flex h-[22px] w-[22px] items-center justify-center rounded-md border-2 border-[#22c55e] bg-[#22c55e] text-white transition hover:bg-[#16a34a]"
        >
          <Check aria-hidden size={14} strokeWidth={3} />
        </button>

        <div className="min-w-0">
          <h3 className="break-words text-[15px] font-normal leading-normal text-[#b09a8a] line-through decoration-from-font">
            {task.title}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-xs font-normal text-[#b09a8a]">
            <Calendar aria-hidden size={14} />
            Completed
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md border border-[#d9d0c3] bg-[#ede8df] px-4 py-3">
      <button
        type="button"
        aria-label={task.isCompleted ? "Mark as active" : "Mark as completed"}
        onClick={() => onToggle(task.id)}
        className={`flex h-[22px] w-[22px] items-center justify-center rounded border transition ${
          task.isCompleted ? "border-[#b84025] bg-[#b84025] text-white" : "border-[#cdbfac] text-transparent hover:text-[#b84025]"
        }`}
      >
        <Check aria-hidden size={14} />
      </button>

      <div className="min-w-0">
        <h3 className={`truncate text-[15px] text-[#2c1a0e] ${task.isCompleted ? "text-[#a89880] line-through" : ""}`}>
          {task.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#a89880]">
          <span className="inline-flex items-center gap-1">
            <Calendar aria-hidden size={14} />
            {formatDate(task.dueDate, task.isCompleted)}
          </span>
          <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>
          {isOverdue && (
            <span className="inline-flex items-center gap-1 rounded border border-[#efb2a5] bg-[#f7ded8] px-2 py-0.5 text-[10px] font-semibold text-[#b84025]">
              <AlertCircle aria-hidden size={12} />
              Overdue
            </span>
          )}
          {task.project && <span className="truncate text-[#7f715f]">#{task.project.name}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
        <button
          type="button"
          aria-label="Edit task"
          title="Edit task"
          onClick={() => onEdit(task)}
          className="flex h-8 w-8 items-center justify-center rounded text-[#7f715f] transition hover:bg-[#e2d7c9] hover:text-[#2c1a0e]"
        >
          <Pencil aria-hidden size={16} />
        </button>
        <button
          type="button"
          aria-label="Delete task"
          title="Delete task"
          onClick={() => onDelete(task.id)}
          className="flex h-8 w-8 items-center justify-center rounded text-[#b84025] transition hover:bg-[#f7ded8]"
        >
          <Trash2 aria-hidden size={16} />
        </button>
      </div>
    </article>
  );
}
