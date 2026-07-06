import { CheckCircle2, Hash, LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { Project } from "@/types";

type SidebarProjectProps = {
  project: Pick<Project, "id" | "name" | "color">;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

function SidebarProject({ project, selected, onSelect, onDelete }: SidebarProjectProps) {
  return (
    <div
      className={`group flex h-10 w-full items-center gap-1 rounded-md transition ${
        selected ? "bg-[#e8dbcf] text-[#b84025]" : "text-[#4a3728] hover:bg-[#ede8df]"
      }`}
    >
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-3 px-3 text-left text-sm">
        <Hash aria-hidden size={20} className="shrink-0" style={{ color: project.color ?? "#a89880" }} />
        <span className="truncate">{project.name}</span>
      </button>
      <button
        type="button"
        aria-label={`Delete project ${project.name}`}
        title="Delete project"
        onClick={onDelete}
        className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded text-[#b84025] opacity-100 transition hover:bg-[#f7ded8] focus:outline-none focus:ring-2 focus:ring-[#b84025]/20 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
      >
        <Trash2 aria-hidden size={15} />
      </button>
    </div>
  );
}

type TaskSidebarProps = {
  projects: Project[];
  totalElements: number;
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onOpenProject: () => void;
  onDeleteProject: (project: Project) => void;
};

export function TaskSidebar({
  projects,
  totalElements,
  selectedProjectId,
  onSelectProject,
  onOpenProject,
  onDeleteProject
}: TaskSidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-[#d9d0c3] bg-[#f2ede4] px-6 py-6 lg:w-[280px]">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#b84025] text-white">
          <CheckCircle2 aria-hidden size={21} />
        </span>
        <span className="font-serif text-xl font-bold text-[#2c1a0e]">To-do list</span>
      </div>

      <nav className="mt-10">
        <button
          type="button"
          onClick={() => onSelectProject(null)}
          className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
            selectedProjectId === null ? "bg-[#e8dbcf] text-[#b84025]" : "text-[#4a3728] hover:bg-[#ede8df]"
          }`}
        >
          <LayoutDashboard aria-hidden size={20} />
          <span className="min-w-0 flex-1 text-left">All Tasks</span>
          <span className="text-xs font-medium">{totalElements}</span>
        </button>
      </nav>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase text-[#a89880]">Projects</h2>
        <button
          type="button"
          aria-label="Create project"
          onClick={onOpenProject}
          className="flex h-6 w-6 items-center justify-center rounded text-[#a89880] transition hover:bg-[#e8dbcf] hover:text-[#b84025]"
        >
          <Plus aria-hidden size={16} />
        </button>
      </div>

      <div className="mt-4 space-y-1">
        {projects.map((project) => (
          <SidebarProject
            key={project.id}
            project={project}
            selected={selectedProjectId === project.id}
            onSelect={() => onSelectProject(project.id)}
            onDelete={() => onDeleteProject(project)}
          />
        ))}

        {projects.length === 0 && (
          <p className="px-3 py-2 text-sm leading-6 text-[#7f715f]">
            No projects yet. Create one when you want to group related tasks.
          </p>
        )}
      </div>
    </aside>
  );
}
