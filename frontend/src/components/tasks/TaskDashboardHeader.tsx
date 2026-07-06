import { Plus, Trash2 } from "lucide-react";
import { Project } from "@/types";

type TaskDashboardHeaderProps = {
  title: string;
  description?: string | null;
  selectedProject: Project | null;
  onCreateTask: () => void;
  onDeleteProject: (project: Project) => void;
};

export function TaskDashboardHeader({
  title,
  description,
  selectedProject,
  onCreateTask,
  onDeleteProject
}: TaskDashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-serif text-4xl font-extrabold leading-tight text-[#2c1a14]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-[#7f715f]">{description}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {selectedProject && (
          <button
            type="button"
            aria-label={`Delete project ${selectedProject.name}`}
            title="Delete project"
            onClick={() => onDeleteProject(selectedProject)}
            className="inline-flex h-[37px] w-[37px] items-center justify-center rounded-md border border-[#d9d0c3] text-[#b84025] transition hover:bg-[#f7ded8] focus:outline-none focus:ring-2 focus:ring-[#b84025]/20"
          >
            <Trash2 aria-hidden size={17} />
          </button>
        )}
        <button
          type="button"
          onClick={onCreateTask}
          className="inline-flex h-[37px] w-fit items-center gap-2 rounded-md bg-[#c0503a] px-4 text-sm font-semibold text-white transition hover:bg-[#a8412f]"
        >
          <Plus aria-hidden size={16} />
          Add task
        </button>
      </div>
    </header>
  );
}
