import { Loader2 } from "lucide-react";
import { Task } from "@/types";
import { TaskRow } from "./TaskRow";

type EmptyTaskState = {
  title: string;
  message: string;
};

type TaskFeedProps = {
  tasks: Task[];
  isLoading: boolean;
  emptyState: EmptyTaskState;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

export function TaskFeed({ tasks, isLoading, emptyState, onToggle, onEdit, onDelete }: TaskFeedProps) {
  return (
    <section className="mt-6 space-y-3">
      {isLoading && (
        <div className="flex h-36 items-center justify-center rounded-md border border-[#d9d0c3] bg-[#ede8df] text-[#7f715f]">
          <Loader2 className="mr-2 animate-spin" aria-hidden size={20} />
          Loading tasks
        </div>
      )}

      {!isLoading &&
        tasks.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))}

      {!isLoading && tasks.length === 0 && (
        <div className="flex min-h-[200px] items-center justify-center text-center">
          <div className="max-w-xs">
            <h2 className="font-serif text-xl font-bold text-[#4a3728]">{emptyState.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#a89880]">{emptyState.message}</p>
          </div>
        </div>
      )}
    </section>
  );
}
