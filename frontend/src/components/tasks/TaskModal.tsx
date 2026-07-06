import { X } from "lucide-react";
import type { TasksViewModel } from "@/hooks/useTasks";
import { TaskPriority } from "@/types";

type TaskModalProps = Pick<
  TasksViewModel,
  | "taskModalMode"
  | "taskForm"
  | "projects"
  | "errorMessages"
  | "setTaskField"
  | "closeTaskModal"
  | "handleSubmitTask"
>;

export function TaskModal(props: TaskModalProps) {
  const isOpen = props.taskModalMode !== null;
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#2c1a0e]/25 px-4">
      <form onSubmit={props.handleSubmitTask} className="w-full max-w-[560px] rounded-lg border border-[#d9d0c3] bg-[#f2ede4] p-8 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-2xl font-bold text-[#2c1a0e]">
            {props.taskModalMode === "edit" ? "Edit Task" : "New Task"}
          </h2>
          <button
            type="button"
            aria-label="Close task form"
            onClick={props.closeTaskModal}
            className="flex h-8 w-8 items-center justify-center rounded text-[#7f715f] hover:bg-[#ede8df]"
          >
            <X aria-hidden size={18} />
          </button>
        </div>

        <input
          aria-label="Task title"
          placeholder="Task title..."
          value={props.taskForm.title}
          onChange={(event) => props.setTaskField("title", event.target.value)}
          className="mt-6 h-12 w-full rounded-md border border-[#d9d0c3] bg-[#ede8df] px-4 text-sm text-[#2c1a0e] outline-none placeholder:text-[#a89880] focus:border-[#b84025]"
        />
        {props.errorMessages.title && <p className="mt-1 text-sm text-[#b84025]">{props.errorMessages.title}</p>}

        <textarea
          aria-label="Task description"
          placeholder="Add description..."
          value={props.taskForm.description}
          onChange={(event) => props.setTaskField("description", event.target.value)}
          className="mt-6 min-h-[120px] w-full resize-y rounded-md border border-[#d9d0c3] bg-[#ede8df] px-4 py-3 text-sm text-[#2c1a0e] outline-none placeholder:text-[#a89880] focus:border-[#b84025]"
        />

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-[#4a3728]">Due Date</span>
            <input
              type="datetime-local"
              value={props.taskForm.dueDate}
              onChange={(event) => props.setTaskField("dueDate", event.target.value)}
              className="mt-2 h-12 w-full rounded-md border border-[#d9d0c3] bg-[#ede8df] px-4 text-sm text-[#2c1a0e] outline-none focus:border-[#b84025]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#4a3728]">Project</span>
            <select
              value={props.taskForm.projectId}
              onChange={(event) => props.setTaskField("projectId", event.target.value)}
              className="mt-2 h-12 w-full rounded-md border border-[#d9d0c3] bg-[#ede8df] px-4 text-sm text-[#2c1a0e] outline-none focus:border-[#b84025]"
            >
              <option value="">No project</option>
              {props.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-[#4a3728]">Priority</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["LOW", "MEDIUM", "HIGH"] as TaskPriority[]).map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => props.setTaskField("priority", priority)}
                className={`h-8 rounded-md border px-4 text-sm font-medium ${
                  props.taskForm.priority === priority ? "border-[#b84025] bg-[#b84025] text-white" : "border-[#d9d0c3] bg-[#ede8df] text-[#4a3728]"
                }`}
              >
                {priority.charAt(0) + priority.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={props.closeTaskModal} className="h-10 rounded-md px-6 text-sm font-semibold text-[#4a3728] hover:bg-[#ede8df]">
            Cancel
          </button>
          <button type="submit" className="h-10 rounded-md bg-[#b84025] px-6 text-sm font-semibold text-white hover:bg-[#9f351f]">
            {props.taskModalMode === "edit" ? "Save" : "Add Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
